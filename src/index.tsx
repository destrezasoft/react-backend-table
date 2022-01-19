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
let timer = setTimeout(() => { });

export interface Columns {
	title: string;
	field: string;
	sortable: boolean;
	columnType?: string;
	searchable?: boolean;
	thStyle?: {};
	tdStyle?: string;
	visible?: boolean;
	thClass?: string;
	tdClass?: string;
	hasComponent?: boolean;
	componentValue?: any;
}

export interface Options {
	title: string;
	url: string;
	perPage: number[];
	orderBy: string;
	orderType: string;
	columnSearch: boolean;
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
			return <option value={v}>{v}</option>;
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
		timer = setTimeout(() => {
			fetch(fetchUrl, {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
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

	const dataList = () => {
		if (data) {
			return data.map((value: any, key: number) => {
				if (paginationData.perPageData <= key) {
					return null;
				}
				return (
					<tr>
						{columns.map((v, k) => {
							// let fieldKey = v.field;
							if (v.hasComponent) {
								return <td>{v.componentValue(value)} </td>;
							} else return <td>{value[v.field]} </td>;
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
						style={{ textAlign: "left" }}
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
							<BiSortDown className="float-right" size={20}></BiSortDown>
						) : null}
						{column.field === postData.orderBy &&
							postData.orderType === "desc" ? (
							<BiSortUp className="float-right" size={20}></BiSortUp>
						) : null}
					</th>
				);
			} else {
				return (
					<th style={{ textAlign: "left" }} key={index}>
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
					<th style={column.thStyle} key={index}>
						<Form.Control
							className="float-center"
							type="text"
							placeholder="Search ... "
							size="sm"
							name={column.field}
							onChange={(e) => {
								// setTimeout(() => { console.log(e.target.value) } , 5000);
								setColumnSearchData(e.target.name, e.target.value);
							}}
						/>
					</th>
				);
			} else {
				return <th></th>;
			}
		});
	};
	// console.log(dtProps.columns[0]);
	// let options = dtProps.options;

	return (
		<Card>
			<Card.Body>
				<Row>
					<Col md="4">
						<Card.Title>{options.title}</Card.Title>
					</Col>
					<Col className="float-right">
						<Form.Select
							size="sm"
							className="form-control float-right"
							style={{ width: 80, height: 30 }}
							value={paginationData.perPageData}
							onChange={(e) => {
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
					<Col className="float-right">
						<Pagination
							size="sm"
							onClick={(e) => {
								console.log();
							}}
						>
							{makePagination()}
						</Pagination>
					</Col>

					<Col className="float-right" md="3">
						<Form.Control
							style={{ width: "70%", display: "inline" }}
							className="float-center"
							type="text"
							placeholder="Search ... "
							size="sm"
							onChange={(e) => {
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
								console.log("Export Ex");
							}}
						/>
					</Col>
				</Row>
				<Table striped bordered hover>
					<thead>
						<tr>{headerPrint()}</tr>
					</thead>
					{options.columnSearch === true ? (
						<thead>
							<tr>{headerSearchPrint()}</tr>
						</thead>
					) : null}
					<tbody>
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
