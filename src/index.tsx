import React, { FC, useEffect, useState } from "react";
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

import { BiExport, BiSortDown, BiSortUp } from "react-icons/bi";

let timer = window.setTimeout(() => { });

const customStyle = {
	borderWidth: "1px",
    borderColor: "#e7ecf1"
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
}

export interface Options {
	title: string;
	url: string;
	authorization?:string;
	headerExtraData?: { [key: string] : string };
	perPage: number[];
	orderBy: string;
	orderType: string;
	columnSearch: boolean;
	reloadMyTable?:any;
	extraData?: { [key: string] : string };
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
	perPageData: number;
	globalSearch: string;
	// columns:obect
}

interface PostData {
	columns?: LooseObject;
	globalSearch: string;
	limit: number;
	offset: number;
	orderBy: string;
	orderType: string;
}
let BackendTable: FC<DtProps> = ({ columns, options }) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [data, setData] = useState([]);
	const [totalData, setTotalData] = useState<number>(0);

	let initialPostData: PostData;

	initialPostData = {
		globalSearch: "",
		limit: 10,
		offset: 0,
		orderBy: options.orderBy,
		orderType: options.orderType,
		columns: {},
	};

	Object.entries(columns).forEach(([k, v]) => {
		let key = v.field;
		if (initialPostData && initialPostData.columns) {
			initialPostData.columns[key] = {
				filterType: "",
				filterValue: "",
			};
		}
	});

	let initialState = {
		paginationStartWith: 1,
		currentPage: 1,
		perPageData: options.perPage[0],
		globalSearch: "",
	};
	const [paginationData, setPaginationData] =
		useState<paginationData>(initialState);
	const [globalSearchText, setGlobalSearch] = useState<string>("");

	const [postData, setPostData] = useState<PostData>(initialPostData);

	useEffect(() => {
		fetchEntities();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [paginationData, postData]);

	const setColumnSearchData = (key: string, value: string) => {
		if (postData.columns) {
			postData.columns[key].filterValue = value;
			postData.columns[key].filterType = "like";
		}
		setPostData({ ...postData });
		console.log(postData);

		// setPostData({...postData.columns,[key.filterValue]:value })
	};
	const makePagination = () => {
		// console.log(paginationData);
		let items = [];
		let totalPage = Math.ceil(totalData / paginationData.perPageData);
		let pagePrint = totalPage;
		let nextlastDisable = true;
		let previousFirstDisable = true;
		if (totalPage >= 5) {
			pagePrint = 5;
			if (paginationData.currentPage === totalPage) {
				nextlastDisable = true;
			} else nextlastDisable = false;
		}
		if (paginationData.paginationStartWith !== 1) {
			previousFirstDisable = false;
		}

		items.push(
			<Pagination.First
				disabled={previousFirstDisable}
				key={'first'}
				onClick={() => {
					setPaginationData({
						...paginationData,
						currentPage: 1,
						paginationStartWith: 1,
					});
				}}
			/>
		);
		items.push(
			<Pagination.Prev
				disabled={previousFirstDisable}
				key={'prev'}
				onClick={() => {
					if (paginationData.currentPage !== 1)
						setPaginationData({
							...paginationData,
							currentPage: paginationData.currentPage - 1,
							paginationStartWith: paginationData.paginationStartWith - 1,
						});
				}}
			/>
		);

		for (
			let number = paginationData.paginationStartWith;
			pagePrint >= 1;
			number++
		) {
			// page === this.state.entities.current_page
			pagePrint--;
			if (number === paginationData.currentPage) {
				items.push(
					<Pagination.Item key={number} disabled>
						{number}
					</Pagination.Item>
				);
			} else {
				items.push(
					<Pagination.Item
						key={number}
						onClick={() => {
							setPaginationData({ ...paginationData, currentPage: number });
						}}
					>
						{number}
					</Pagination.Item>
				);
			}
		}
		pagePrint = 4;
		items.push(
			<Pagination.Next
				disabled={nextlastDisable}
				key={'next'}
				onClick={() => {
					if (paginationData.currentPage < totalPage)
						setPaginationData({
							...paginationData,
							currentPage: paginationData.currentPage + 1,
							paginationStartWith: paginationData.paginationStartWith + 1,
						});
				}}
			/>
		);
		items.push(
			<Pagination.Last
				disabled={nextlastDisable}
				key={'last'}
				onClick={() => {
					setPaginationData({
						...paginationData,
						currentPage: totalPage,
						paginationStartWith: totalPage - pagePrint,
					});
				}}
			/>
		);

		return items;
	};

	const makePerPageSelectBox = () => {
		return options.perPage.map((v, k) => {
			return <option key={k} value={v}>{v}</option>;
		});
	};

	const fetchEntities = () => {
		setIsLoading(true);
		let fetchUrl = options.url;
		// console.log(postData);
		let searchParams = new URLSearchParams();
		if (postData) {
			postData.limit = paginationData.perPageData;
			postData.offset =
				(paginationData.currentPage - 1) * paginationData.perPageData;
			postData.globalSearch = paginationData.globalSearch;
		}

		searchParams.append('extraData' ,JSON.stringify(options.extraData)) ;
		

		Object.entries(postData ? postData : {}).forEach(([key, value]) => {
			if (key !== "columns") {
				searchParams.append(key, value);
			}
		});

		Object.entries(postData?.columns ? postData.columns : {}).forEach(
			([k, v]) => {
				searchParams.append(`columns[${k}][0][filterType]`, v.filterType);
				searchParams.append(`columns[${k}][0][filterValue]`, v.filterValue);
			}
		);
		// searchParams["columns"]["email"]

		window.clearTimeout(timer);
		timer = window.setTimeout(() => {
		
			const requestHeaders: HeadersInit = new Headers();
			requestHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
			if(options.authorization !== undefined)
				requestHeaders.append('Authorization',options.authorization);
			if(options.headerExtraData !== undefined  ){
				Object.keys(options.headerExtraData).forEach((k, i) => {
					if(options.headerExtraData !== undefined)
						requestHeaders.append(k,options.headerExtraData[k]);
				});
			}

			fetch(fetchUrl, {
				method: "POST",
				headers: requestHeaders ,
				body: searchParams,
			})
				.then((resp) => {
					return resp.json();
				})
				.then((response) => {
					setData(response.data.data);
					// setPaginationData({...paginationData , totalData:response.data.total });
					setTotalData(parseInt(response.data.total));
					setIsLoading(false);
				})
				.catch((error) => {
					setIsLoading(false);
					console.log(error, "catch the hoop");
				});
		}, 500);
	};
    options.reloadMyTable = fetchEntities;

	const dataList = () => {
		if (data) {
			return data.map((value: any, key: number) => {
				if (paginationData.perPageData <= key) {
					return null;
				}
				return (
					<tr key={key}>
						{columns.map((v, k) => {
							// let fieldKey = v.field;
							if (v.hasComponent) {
								return <td key={k} className={v.tdClass} style={v.tdStyle}>{v.componentValue(value)} </td>;
							} else return <td key={k} className={v.tdClass} style={v.tdStyle}>{value[v.field]} </td>;
						})}
					</tr>
				);
			});
		}
	};

	const headerPrint = () => {
		return columns.map((column, index) => {
			if (column.sortable === true) {
				return (
					<th
						className={column.thClass}
						style={column.thStyle}
						key={index}
						onClick={() => {
							setPostData({
								...postData,
								orderBy: column.field,
								orderType: postData.orderType === "asc" ? "desc" : "asc",
							});
						}}
					>
						{column.title}
						{column.field === postData.orderBy &&
							postData.orderType === "asc" ? (
							<BiSortDown key={index + 'asc'} className="float-right" size={20}></BiSortDown>
						) : null}
						{column.field === postData.orderBy &&
							postData.orderType === "desc" ? (
							<BiSortUp key={index + 'desc'} className="float-right" size={20}></BiSortUp>
						) : null}
					</th>
				);
			} else {
				return (
					<th style={column.thStyle} key={index}>
						{column.title}
					</th>
				);
			}
		});
	};

	const headerSearchPrint = () => {
		return columns.map((column, index) => {
			if (column.searchable) {
				return (
					<th key={index}>
						<Form.Control
						    key = {index+ 'search'}
							className="float-center"
							type="text"
							placeholder="Search ... "
							size="sm"
							name={column.field}
							onChange={(e:any) => {
								setColumnSearchData(e.target.name, e.target.value);
							}}
						/>
					</th>
				);
			} else {
				return <th key = {index } ></th>;
			}
		});
	};
	// console.log(dtProps.columns[0]);
	// let options = dtProps.options;

	const exportData = () =>{
		let currentData = [];
		let headersTitle: any[] = [];
		columns.map((column) => {
			if(!column.hasComponent){
				headersTitle.push(column.title);
			}
		});
		currentData.push(headersTitle);
		data.map((value) => {
			var rows: any[] = [];
			columns.map((column, index) => {
				if(!column.hasComponent){
					rows.push(value[column.field]);
				}
			});
			currentData.push(rows);
		});
		exportToCsv('My Data.csv', currentData);
	}

	const exportToCsv = (filename: string, rows: any[]) => {
		var processRow = function (row: any[]) {
			var finalVal = '';
			for (var j = 0; j < row.length; j++) {
				var innerValue = row[j] === null || row[j] === undefined ? '' : row[j].toString();
				if (row[j] instanceof Date) {
					innerValue = row[j].toLocaleString();
				};
				var result = innerValue.replace(/"/g, '""');
				if (result.search(/("|,|\n)/g) >= 0)
					result = '"' + result + '"';
				if (j > 0)
					finalVal += ',';
				finalVal += result;
			}
			return finalVal + '\n';
		};
		
		var csvFile = '';
		for (var i = 0; i < rows.length; i++) {
			csvFile += processRow(rows[i]);
		}
		
		var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
		var link = document.createElement("a");
		if (link.download !== undefined) { 
			// Browsers that support HTML5 download attribute
			var url = URL.createObjectURL(blob);
			link.setAttribute("href", url);
			link.setAttribute("download", filename);
			link.style.visibility = 'hidden';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	}

	return (
		<Card>
			<Card.Body>
				<Row>
					<Col md="4">
						<Card.Title>{options.title}</Card.Title>
					</Col>
				</Row>
				<Row>
					<Col className="float-left" md="1">
						<Form.Select
							size="sm"
							className="form-control float-left"
							style={{height: 35 }}
							value={paginationData.perPageData}
							onChange={(e:any) => {
								setPaginationData({
									...paginationData,
									perPageData: Number(e.target.value),
									currentPage: 1,
									paginationStartWith: 1,
								});
							}}
						>
							{makePerPageSelectBox()}
						</Form.Select>
					</Col>
					<Col className="float-left" style={{paddingLeft:"0px", paddingTop:"5px"}} md="2"> of {totalData}</Col>
					<Col className="float-left" md="4">
						<Pagination
							size="sm"
							onClick={(e) => {
								console.log();
							}}
						>
							{makePagination()}
						</Pagination>
					</Col>

					<Col className="float-right" md="5">
						<Form.Control
							style={{ width: "70%", display: "inline" }}
							className="float-center"
							type="text"
							placeholder="Search ... "
							size="sm"
							onChange={(e:any) => {
								setGlobalSearch(e.target.value);
							}}
						/>

						<Button
							variant="outline"
							className="btn btn-success btn-lg "
							style={{ marginLeft: "10px" }}
							size="sm"
							onClick={() => {
								setPaginationData({
									...paginationData,
									globalSearch: globalSearchText,
									currentPage: 1,
									paginationStartWith: 1,
								});
							}}
						>
							Show
						</Button>
						<BiExport
							style={{ marginLeft: "5px" }}
							size={30}
							onClick={() => {
								exportData();
							}}
						/>
					</Col>
				</Row>
				<Table striped bordered hover responsive="sm" borderless={false} style={{marginTop:"10px"}}>
					<thead style={customStyle}>
						<tr>{headerPrint()}</tr>
					</thead>
					{options.columnSearch === true ? (
						<thead style={customStyle}>
							<tr>{headerSearchPrint()}</tr>
						</thead>
					) : null}
					<tbody style={customStyle}>
						{!isLoading ? (
							dataList()
						) : (
							<tr style={{ textAlign: "center" }}>
								<td colSpan={columns.length}>
									<Spinner animation="border" role="status"></Spinner>
								</td>
							</tr>
						)}
						{console.log(typeof totalData)}
						{!isLoading && totalData === 0 ? (
							<tr style={{ textAlign: "center" }}>
								<td colSpan={columns.length}>No Data Found</td>
							</tr>
						) : null}
					</tbody>
				</Table>
			</Card.Body>
		</Card>
	);
};

export default BackendTable;
