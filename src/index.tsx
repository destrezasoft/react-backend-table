import React, {
	FC,
	useEffect,
	useState,
	useImperativeHandle,
	forwardRef
} from "react";
import "react-bootstrap";
import {
	Table,
	Card,
	Button,
	Pagination,
	Form,
	Row,
	Col,
	Spinner,
} from "react-bootstrap";
import parse from 'html-react-parser';
import { BiExport, BiSortDown, BiSortUp } from "react-icons/bi";
import Select from 'react-select';

let timer = window.setTimeout(() => { });

const customStyle = {
	borderWidth: "1px",
	borderColor: "#e7ecf1"
};

const stickyHeaderStyle: React.CSSProperties = {
	position: 'sticky',
	top: 0,
	backgroundColor: '#fff'
};

export interface Columns {
	title: string;
	field: string;
	sortable: boolean;
	columnType?: string;
	searchable?: boolean;
	thStyle?: {};
	tdStyle?: {};
	visible?: boolean;
	thClass?: string;
	tdClass?: string;
	hasComponent?: boolean;
	componentValue?: any;
	hasHtml?: boolean;
	htmlValue?: any;
	isMultiSelect?: boolean;
	isSelect?: boolean;
	selectOptions?: { value: number | string; label: string }[];
	placeholder?: string;
	searchBarWidth?: string;
}

export interface Options {
	title: string;
	url: string;
	authorization?: string;
	headerExtraData?: { [key: string]: string };
	perPage: any[];
	orderBy: string;
	orderType: string;
	columnSearch: boolean;
	extraData?: { [key: string]: string };
}

export interface DtProps {
	columns: Columns[];
	options: Options;
}

export interface columnFilter {
	filterType: string;
	filterValue: string;
}
export interface LooseObject {
	[key: string]: columnFilter;
}

interface paginationData {
	paginationStartWith: number;
	currentPage: number;
	perPageData: any;
	globalSearch: string;
}

interface PostData {
	columns?: LooseObject;
	globalSearch: string;
	limit: number;
	offset: number;
	orderBy: string;
	orderType: string;
}

const BackendTable = forwardRef<unknown, DtProps>(({ columns, options }, ref) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [data, setData] = useState([]);
	const [totalData, setTotalData] = useState<number>(0);
	const [totalExpenseAmount, setTotalExpenseAmount] = useState<number>(0);

	let initialPostData: PostData = {
		globalSearch: "",
		limit: 10,
		offset: 0,
		orderBy: options.orderBy,
		orderType: options.orderType,
		columns: {},
	};

	columns.forEach((v) => {
		initialPostData.columns![v.field] = {
			filterType: "",
			filterValue: "",
		};
	});

	const [paginationData, setPaginationData] = useState<paginationData>({
		paginationStartWith: 1,
		currentPage: 1,
		perPageData: options.perPage[0],
		globalSearch: "",
	});

	const [globalSearchText, setGlobalSearch] = useState<string>("");
	const [postData, setPostData] = useState<PostData>(initialPostData);

	useEffect(() => {
		fetchEntities();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [paginationData, postData]);

	const setColumnSearchData = (key: string, value: string) => {
		postData.columns![key].filterValue = value;
		postData.columns![key].filterType = "like";
		setPostData({ ...postData });
	};

	const makePagination = () => {
		let items = [];
		let totalPage = Math.ceil(totalData / (paginationData.perPageData !== 'All' ? paginationData.perPageData : totalData));
		let pagePrint = totalPage;
		let nextlastDisable = paginationData.currentPage === totalPage;
		let previousFirstDisable = paginationData.paginationStartWith === 1;

		if (totalPage >= 5) {
			pagePrint = 5;
			nextlastDisable = paginationData.currentPage === totalPage;
		}

		items.push(
			<Pagination.First disabled={previousFirstDisable} key="first" onClick={() =>
				setPaginationData({ ...paginationData, currentPage: 1, paginationStartWith: 1 })} />
		);
		items.push(
			<Pagination.Prev disabled={previousFirstDisable} key="prev" onClick={() => {
				if (paginationData.currentPage !== 1) {
					setPaginationData({
						...paginationData,
						currentPage: paginationData.currentPage - 1,
						paginationStartWith: paginationData.paginationStartWith - 1,
					});
				}
			}} />
		);

		for (let number = paginationData.paginationStartWith; pagePrint >= 1; number++) {
			pagePrint--;
			items.push(
				<Pagination.Item
					key={number}
					active={number === paginationData.currentPage}
					onClick={() =>
						setPaginationData({ ...paginationData, currentPage: number })
					}>
					{number}
				</Pagination.Item>
			);
		}

		items.push(
			<Pagination.Next disabled={nextlastDisable} key="next" onClick={() => {
				if (paginationData.currentPage < totalPage)
					setPaginationData({
						...paginationData,
						currentPage: paginationData.currentPage + 1,
						paginationStartWith: paginationData.paginationStartWith + 1,
					});
			}} />
		);
		items.push(
			<Pagination.Last disabled={nextlastDisable} key="last" onClick={() =>
				setPaginationData({
					...paginationData,
					currentPage: totalPage,
					paginationStartWith: totalPage - 4,
				})} />
		);
		return items;
	};

	const makePerPageSelectBox = () => {
		return options.perPage.map((v, k) => (
			<option key={k} value={v}>{v}</option>
		));
	};

	const fetchEntities = () => {
		setIsLoading(true);
		let fetchUrl = options.url;
		let searchParams = new URLSearchParams();

		postData.limit = paginationData.perPageData !== 'All' ? paginationData.perPageData : totalData;
		postData.offset = (paginationData.currentPage - 1) * (paginationData.perPageData !== 'All' ? paginationData.perPageData : 1);
		postData.globalSearch = paginationData.globalSearch;

		searchParams.append('extraData', JSON.stringify(options.extraData));

		Object.entries(postData).forEach(([key, value]) => {
			if (key !== "columns") {
				searchParams.append(key, value.toString());
			}
		});

		Object.entries(postData.columns!).forEach(([k, v]) => {
			searchParams.append(`columns[${k}][0][filterType]`, v.filterType);
			searchParams.append(`columns[${k}][0][filterValue]`, v.filterValue);
		});

		window.clearTimeout(timer);
		timer = window.setTimeout(() => {
			const requestHeaders: HeadersInit = new Headers();
			requestHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
			if (options.authorization) requestHeaders.append('Authorization', options.authorization);
			if (options.headerExtraData) {
				Object.entries(options.headerExtraData).forEach(([k, v]) => {
					requestHeaders.append(k, v);
				});
			}

			fetch(fetchUrl, {
				method: "POST",
				headers: requestHeaders,
				body: searchParams,
			})
				.then(resp => resp.json())
				.then(response => {
					setData(response.data.data);
					setTotalData(parseInt(response.data.total));
					setTotalExpenseAmount(response.data.totalExpenseAmount || 0);
					setIsLoading(false);
				})
				.catch(error => {
					console.log(error, "catch the hoop");
					setIsLoading(false);
				});
		}, 500);
	};

	useImperativeHandle(ref, () => ({
		reload: fetchEntities
	}));

	const dataList = () => {
		return data.map((value: any, key: number) => (
			<tr key={key}>
				{columns.map((v, k) => {
					if (v.hasComponent) return <td key={k} className={v.tdClass} style={v.tdStyle}>{v.componentValue(value)}</td>;
					if (v.hasHtml) return <td key={k} className={v.tdClass} style={v.tdStyle}>{parse(v.htmlValue(value))}</td>;
					return <td key={k} className={v.tdClass} style={v.tdStyle}>{value[v.field]}</td>;
				})}
			</tr>
		));
	};

	const headerPrint = () => columns.map((column, index) => (
		<th className={column.thClass} style={column.thStyle} key={index}
			onClick={() => {
				if (column.sortable) {
					setPostData({
						...postData,
						orderBy: column.field,
						orderType: postData.orderType === "asc" ? "desc" : "asc",
					});
				}
			}}>
			{column.title}
			{column.field === postData.orderBy && (
				postData.orderType === "asc"
					? <BiSortUp className="float-right" size={20} />
					: <BiSortDown className="float-right" size={20} />
			)}
		</th>
	));

	const headerSearchPrint = () => columns.map((column, index) => {
		if (!column.searchable) return <th key={index}></th>;

		if (column.isMultiSelect && column.selectOptions) {
			return (
				<th key={index}>
					<Select
						isMulti
						options={column.selectOptions}
						className="form-control-sm"
						placeholder={column.placeholder || "Select ..."}
						onChange={(selected: any) => {
							const values = selected.map((opt: any) => opt.value).join("!");
							setColumnSearchData(column.field, values);
						}}
						styles={{ control: (base: any) => ({ ...base, width: column.searchBarWidth }) }}
					/>
				</th>
			);
		} else if (column.isSelect && column.selectOptions) {
			return (
				<th key={index}>
					<Select
						options={column.selectOptions}
						className="form-control-sm"
						placeholder={column.placeholder || "Select ..."}
						onChange={(opt: any) => opt && setColumnSearchData(column.field, opt.value)}
						styles={{ control: (base: any) => ({ ...base, width: column.searchBarWidth }) }}
					/>
				</th>
			);
		} else {
			return (
				<th key={index}>
					<Form.Control
						type="text"
						size="sm"
						name={column.field}
						placeholder={column.placeholder || "Search ..."}
						onChange={(e) => setColumnSearchData(e.target.name, e.target.value)}
					/>
				</th>
			);
		}
	});

	const exportData = () => {
		let rows = [columns.map(c => c.title)];
		data.forEach((item) => {
			let row = columns.map(c => (!c.hasComponent && !c.hasHtml) ? item[c.field] : '');
			rows.push(row);
		});
		exportToCsv("My Data.csv", rows);
	};

	const exportToCsv = (filename: string, rows: any[]) => {
		let processRow = (row: any[]) => {
			return row.map(v => {
				let val = v === null || v === undefined ? '' : v.toString();
				val = val.replace(/"/g, '""');
				return /("|,|\n)/.test(val) ? `"${val}"` : val;
			}).join(",") + "\n";
		};

		let csv = rows.map(processRow).join('');
		let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		let link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.setAttribute("download", filename);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<Card>
			<Card.Body>
				<Row>
					<Col md="4"><Card.Title>{options.title}</Card.Title></Col>
				</Row>
				<Row>
					<Col md="1">
						<Form.Select
							size="sm"
							value={paginationData.perPageData}
							onChange={(e) => setPaginationData({
								...paginationData,
								perPageData: e.target.value,
								currentPage: 1,
								paginationStartWith: 1,
							})}
						>{makePerPageSelectBox()}</Form.Select>
					</Col>
					<Col md="2"> of {totalData}</Col>
					<Col md="4"><Pagination size="sm">{makePagination()}</Pagination></Col>
					<Col md="5">
						<Form.Control
							style={{ width: "70%", display: "inline" }}
							type="text"
							placeholder="Search ..."
							size="sm"
							onChange={(e) => setGlobalSearch(e.target.value)}
						/>
						<Button
							variant="success"
							size="sm"
							style={{ marginLeft: "10px" }}
							onClick={() =>
								setPaginationData({
									...paginationData,
									globalSearch: globalSearchText,
									currentPage: 1,
									paginationStartWith: 1,
								})
							}>
							Show
						</Button>
						<BiExport size={30} style={{ marginLeft: "5px" }} onClick={exportData} />
					</Col>
				</Row>

				{totalExpenseAmount > 0 && (
					<Row><h4>Total Expense Amount: {totalExpenseAmount}</h4></Row>
				)}

				<Table striped bordered hover responsive style={{ marginTop: "10px" }}>
					<thead style={stickyHeaderStyle}>
						<tr>{headerPrint()}</tr>
						{options.columnSearch && <tr>{headerSearchPrint()}</tr>}
					</thead>
					<tbody style={customStyle}>
						{!isLoading ? dataList() : (
							<tr><td colSpan={columns.length}><Spinner animation="border" /></td></tr>
						)}
						{!isLoading && totalData === 0 && (
							<tr><td colSpan={columns.length}>No Data Found</td></tr>
						)}
					</tbody>
				</Table>
			</Card.Body>
		</Card>
	);
});

export default React.memo(BackendTable);
