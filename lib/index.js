import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import "react-bootstrap";
import { Table, Card, Button, Pagination, Form, Row, Col, Spinner, } from "react-bootstrap";
import parse from 'html-react-parser';
import { BiExport, BiSortDown, BiSortUp } from "react-icons/bi";
let timer = window.setTimeout(() => { });
const customStyle = {
    borderWidth: "1px",
    borderColor: "#e7ecf1"
};
let BackendTable = ({ columns, options }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState([]);
    const [totalData, setTotalData] = useState(0);
    const [totalExpenseAmount, setTotalExpenseAmount] = useState(0);
    let initialPostData;
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
    const [paginationData, setPaginationData] = useState(initialState);
    const [globalSearchText, setGlobalSearch] = useState("");
    const [postData, setPostData] = useState(initialPostData);
    useEffect(() => {
        fetchEntities();
    }, [paginationData, postData]);
    const setColumnSearchData = (key, value) => {
        if (postData.columns) {
            postData.columns[key].filterValue = value;
            postData.columns[key].filterType = "like";
        }
        setPostData(Object.assign({}, postData));
        console.log(postData);
    };
    const makePagination = () => {
        let items = [];
        let totalPage = Math.ceil(totalData / paginationData.perPageData);
        let pagePrint = totalPage;
        let nextlastDisable = true;
        let previousFirstDisable = true;
        if (totalPage >= 5) {
            pagePrint = 5;
            if (paginationData.currentPage === totalPage) {
                nextlastDisable = true;
            }
            else
                nextlastDisable = false;
        }
        if (paginationData.paginationStartWith !== 1) {
            previousFirstDisable = false;
        }
        items.push(_jsx(Pagination.First, { disabled: previousFirstDisable, onClick: () => {
                setPaginationData(Object.assign(Object.assign({}, paginationData), { currentPage: 1, paginationStartWith: 1 }));
            } }, 'first'));
        items.push(_jsx(Pagination.Prev, { disabled: previousFirstDisable, onClick: () => {
                if (paginationData.currentPage !== 1)
                    setPaginationData(Object.assign(Object.assign({}, paginationData), { currentPage: paginationData.currentPage - 1, paginationStartWith: paginationData.paginationStartWith - 1 }));
            } }, 'prev'));
        for (let number = paginationData.paginationStartWith; pagePrint >= 1; number++) {
            pagePrint--;
            if (number === paginationData.currentPage) {
                items.push(_jsx(Pagination.Item, Object.assign({ disabled: true }, { children: number }), number));
            }
            else {
                items.push(_jsx(Pagination.Item, Object.assign({ onClick: () => {
                        setPaginationData(Object.assign(Object.assign({}, paginationData), { currentPage: number }));
                    } }, { children: number }), number));
            }
        }
        pagePrint = 4;
        items.push(_jsx(Pagination.Next, { disabled: nextlastDisable, onClick: () => {
                if (paginationData.currentPage < totalPage)
                    setPaginationData(Object.assign(Object.assign({}, paginationData), { currentPage: paginationData.currentPage + 1, paginationStartWith: paginationData.paginationStartWith + 1 }));
            } }, 'next'));
        items.push(_jsx(Pagination.Last, { disabled: nextlastDisable, onClick: () => {
                setPaginationData(Object.assign(Object.assign({}, paginationData), { currentPage: totalPage, paginationStartWith: totalPage - pagePrint }));
            } }, 'last'));
        return items;
    };
    const makePerPageSelectBox = () => {
        return options.perPage.map((v, k) => {
            return _jsx("option", Object.assign({ value: v }, { children: v }), k);
        });
    };
    const fetchEntities = () => {
        setIsLoading(true);
        let fetchUrl = options.url;
        let searchParams = new URLSearchParams();
        if (postData) {
            postData.limit = paginationData.perPageData;
            postData.offset =
                (paginationData.currentPage - 1) * paginationData.perPageData;
            postData.globalSearch = paginationData.globalSearch;
        }
        searchParams.append('extraData', JSON.stringify(options.extraData));
        Object.entries(postData ? postData : {}).forEach(([key, value]) => {
            if (key !== "columns") {
                searchParams.append(key, value);
            }
        });
        Object.entries((postData === null || postData === void 0 ? void 0 : postData.columns) ? postData.columns : {}).forEach(([k, v]) => {
            searchParams.append(`columns[${k}][0][filterType]`, v.filterType);
            searchParams.append(`columns[${k}][0][filterValue]`, v.filterValue);
        });
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
            const requestHeaders = new Headers();
            requestHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
            if (options.authorization !== undefined)
                requestHeaders.append('Authorization', options.authorization);
            if (options.headerExtraData !== undefined) {
                Object.keys(options.headerExtraData).forEach((k, i) => {
                    if (options.headerExtraData !== undefined)
                        requestHeaders.append(k, options.headerExtraData[k]);
                });
            }
            fetch(fetchUrl, {
                method: "POST",
                headers: requestHeaders,
                body: searchParams,
            })
                .then((resp) => {
                return resp.json();
            })
                .then((response) => {
                setData(response.data.data);
                setTotalData(parseInt(response.data.total));
                setTotalExpenseAmount(response.data.totalExpenseAmount ? response.data.totalExpenseAmount : 0);
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
            return data.map((value, key) => {
                if (paginationData.perPageData <= key) {
                    return null;
                }
                return (_jsx("tr", { children: columns.map((v, k) => {
                        if (v.hasComponent) {
                            return _jsxs("td", Object.assign({ className: v.tdClass, style: v.tdStyle }, { children: [v.componentValue(value), " "] }), k);
                        }
                        else if (v.hasHtml) {
                            return _jsx("td", Object.assign({ className: v.tdClass, style: v.tdStyle }, { children: parse(v.htmlValue(value)) }), k);
                        }
                        else
                            return _jsxs("td", Object.assign({ className: v.tdClass, style: v.tdStyle }, { children: [value[v.field], " "] }), k);
                    }) }, key));
            });
        }
    };
    const headerPrint = () => {
        return columns.map((column, index) => {
            if (column.sortable === true) {
                return (_jsxs("th", Object.assign({ className: column.thClass, style: column.thStyle, onClick: () => {
                        setPostData(Object.assign(Object.assign({}, postData), { orderBy: column.field, orderType: postData.orderType === "asc" ? "desc" : "asc" }));
                    } }, { children: [column.title, column.field === postData.orderBy &&
                            postData.orderType === "asc" ? (_jsx(BiSortDown, { className: "float-right", size: 20 }, index + 'asc')) : null, column.field === postData.orderBy &&
                            postData.orderType === "desc" ? (_jsx(BiSortUp, { className: "float-right", size: 20 }, index + 'desc')) : null] }), index));
            }
            else {
                return (_jsx("th", Object.assign({ style: column.thStyle }, { children: column.title }), index));
            }
        });
    };
    const headerSearchPrint = () => {
        return columns.map((column, index) => {
            if (column.searchable) {
                return (_jsx("th", { children: _jsx(Form.Control, { className: "float-center", type: "text", placeholder: "Search ... ", size: "sm", name: column.field, onChange: (e) => {
                            setColumnSearchData(e.target.name, e.target.value);
                        } }, index + 'search') }, index));
            }
            else {
                return _jsx("th", {}, index);
            }
        });
    };
    const exportData = () => {
        let currentData = [];
        let headersTitle = [];
        columns.map((column) => {
            if (!column.hasComponent || !column.hasHtml) {
                headersTitle.push(column.title);
            }
        });
        currentData.push(headersTitle);
        data.map((value) => {
            var rows = [];
            columns.map((column, index) => {
                if (!column.hasComponent || !column.hasHtml) {
                    rows.push(value[column.field]);
                }
            });
            currentData.push(rows);
        });
        exportToCsv('My Data.csv', currentData);
    };
    const exportToCsv = (filename, rows) => {
        var processRow = function (row) {
            var finalVal = '';
            for (var j = 0; j < row.length; j++) {
                var innerValue = row[j] === null || row[j] === undefined ? '' : row[j].toString();
                if (row[j] instanceof Date) {
                    innerValue = row[j].toLocaleString();
                }
                ;
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
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    return (_jsx(Card, { children: _jsxs(Card.Body, { children: [_jsx(Row, { children: _jsx(Col, Object.assign({ md: "4" }, { children: _jsx(Card.Title, { children: options.title }) })) }), _jsxs(Row, { children: [_jsx(Col, Object.assign({ className: "float-left", md: "1" }, { children: _jsx(Form.Select, Object.assign({ size: "sm", className: "form-control float-left", style: { height: 35 }, value: paginationData.perPageData, onChange: (e) => {
                                    setPaginationData(Object.assign(Object.assign({}, paginationData), { perPageData: Number(e.target.value), currentPage: 1, paginationStartWith: 1 }));
                                } }, { children: makePerPageSelectBox() })) })), _jsxs(Col, Object.assign({ className: "float-left", style: { paddingLeft: "0px", paddingTop: "5px" }, md: "2" }, { children: [" of ", totalData] })), _jsx(Col, Object.assign({ className: "float-left", md: "4" }, { children: _jsx(Pagination, Object.assign({ size: "sm", onClick: (e) => {
                                    console.log();
                                } }, { children: makePagination() })) })), _jsxs(Col, Object.assign({ className: "float-right", md: "5" }, { children: [_jsx(Form.Control, { style: { width: "70%", display: "inline" }, className: "float-center", type: "text", placeholder: "Search ... ", size: "sm", onChange: (e) => {
                                        setGlobalSearch(e.target.value);
                                    } }), _jsx(Button, Object.assign({ variant: "outline", className: "btn btn-success btn-lg ", style: { marginLeft: "10px" }, size: "sm", onClick: () => {
                                        setPaginationData(Object.assign(Object.assign({}, paginationData), { globalSearch: globalSearchText, currentPage: 1, paginationStartWith: 1 }));
                                    } }, { children: "Show" })), _jsx(BiExport, { style: { marginLeft: "5px" }, size: 30, onClick: () => {
                                        exportData();
                                    } })] }))] }), totalExpenseAmount > 0 &&
                    _jsx(Row, Object.assign({ style: { marginTop: "2px" } }, { children: _jsxs("h4", { children: ["Total Expense Amount: ", totalExpenseAmount] }) })), _jsxs(Table, Object.assign({ striped: true, bordered: true, hover: true, responsive: "sm", borderless: false, style: { marginTop: "10px" } }, { children: [_jsx("thead", Object.assign({ style: customStyle }, { children: _jsx("tr", { children: headerPrint() }) })), options.columnSearch === true ? (_jsx("thead", Object.assign({ style: customStyle }, { children: _jsx("tr", { children: headerSearchPrint() }) }))) : null, _jsxs("tbody", Object.assign({ style: customStyle }, { children: [!isLoading ? (dataList()) : (_jsx("tr", Object.assign({ style: { textAlign: "center" } }, { children: _jsx("td", Object.assign({ colSpan: columns.length }, { children: _jsx(Spinner, { animation: "border", role: "status" }) })) }))), console.log(typeof totalData), !isLoading && totalData === 0 ? (_jsx("tr", Object.assign({ style: { textAlign: "center" } }, { children: _jsx("td", Object.assign({ colSpan: columns.length }, { children: "No Data Found" })) }))) : null] }))] }))] }) }));
};
export default BackendTable;
//# sourceMappingURL=index.js.map