import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import "react-bootstrap";
import { Table, Card, Button, Pagination, Form, Row, Col, Spinner, } from "react-bootstrap";
import { BiExport, BiSortDown, BiSortUp } from "react-icons/bi";
let timer = setTimeout(() => { });
let BackendTable = ({ columns, options }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState([]);
    const [totalData, setTotalData] = useState(0);
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
            } }, void 0));
        items.push(_jsx(Pagination.Prev, { disabled: previousFirstDisable, onClick: () => {
                if (paginationData.currentPage !== 1)
                    setPaginationData(Object.assign(Object.assign({}, paginationData), { currentPage: paginationData.currentPage - 1, paginationStartWith: paginationData.paginationStartWith - 1 }));
            } }, void 0));
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
            } }, void 0));
        items.push(_jsx(Pagination.Last, { disabled: nextlastDisable, onClick: () => {
                setPaginationData(Object.assign(Object.assign({}, paginationData), { currentPage: totalPage, paginationStartWith: totalPage - pagePrint }));
            } }, void 0));
        return items;
    };
    const makePerPageSelectBox = () => {
        return options.perPage.map((v, k) => {
            return _jsx("option", Object.assign({ value: v }, { children: v }), void 0);
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
            return data.map((value, key) => {
                if (paginationData.perPageData <= key) {
                    return null;
                }
                return (_jsx("tr", { children: columns.map((v, k) => {
                        if (v.hasComponent) {
                            return _jsxs("td", { children: [v.componentValue(value), " "] }, void 0);
                        }
                        else
                            return _jsxs("td", { children: [value[v.field], " "] }, void 0);
                    }) }, void 0));
            });
        }
    };
    const headerPrint = () => {
        return columns.map((column, index) => {
            if (column.sortable === true) {
                return (_jsxs("th", Object.assign({ style: { textAlign: "left" }, onClick: () => {
                        setPostData(Object.assign(Object.assign({}, postData), { orderBy: column.field, orderType: postData.orderType === "asc" ? "desc" : "asc" }));
                    } }, { children: [column.title, column.field === postData.orderBy &&
                            postData.orderType === "asc" ? (_jsx(BiSortDown, { className: "float-right", size: 20 }, void 0)) : null, column.field === postData.orderBy &&
                            postData.orderType === "desc" ? (_jsx(BiSortUp, { className: "float-right", size: 20 }, void 0)) : null] }), index));
            }
            else {
                return (_jsx("th", Object.assign({ style: { textAlign: "left" } }, { children: column.title }), index));
            }
        });
    };
    const headerSearchPrint = () => {
        return columns.map((column, index) => {
            if (column.searchable) {
                return (_jsx("th", Object.assign({ style: column.thStyle }, { children: _jsx(Form.Control, { className: "float-center", type: "text", placeholder: "Search ... ", size: "sm", name: column.field, onChange: (e) => {
                            setColumnSearchData(e.target.name, e.target.value);
                        } }, void 0) }), index));
            }
            else {
                return _jsx("th", {}, void 0);
            }
        });
    };
    return (_jsx(Card, { children: _jsxs(Card.Body, { children: [_jsxs(Row, { children: [_jsx(Col, Object.assign({ md: "4" }, { children: _jsx(Card.Title, { children: options.title }, void 0) }), void 0), _jsx(Col, Object.assign({ className: "float-right" }, { children: _jsx(Form.Select, Object.assign({ size: "sm", className: "form-control float-right", style: { width: 80, height: 30 }, value: paginationData.perPageData, onChange: (e) => {
                                    setPaginationData(Object.assign(Object.assign({}, paginationData), { perPageData: Number(e.target.value), currentPage: 1, paginationStartWith: 1 }));
                                } }, { children: makePerPageSelectBox() }), void 0) }), void 0), _jsx(Col, Object.assign({ className: "float-right" }, { children: _jsx(Pagination, Object.assign({ size: "sm", onClick: (e) => {
                                    console.log();
                                } }, { children: makePagination() }), void 0) }), void 0), _jsxs(Col, Object.assign({ className: "float-right", md: "3" }, { children: [_jsx(Form.Control, { style: { width: "70%", display: "inline" }, className: "float-center", type: "text", placeholder: "Search ... ", size: "sm", onChange: (e) => {
                                        setGlobalSearch(e.target.value);
                                    } }, void 0), _jsx(Button, Object.assign({ variant: "outline", className: "btn btn-success btn-lg ", style: { marginLeft: "10px" }, size: "sm", onClick: () => {
                                        setPaginationData(Object.assign(Object.assign({}, paginationData), { globalSearch: globalSearchText, currentPage: 1, paginationStartWith: 1 }));
                                    } }, { children: "Show" }), void 0), _jsx(BiExport, { style: { marginLeft: "5px" }, size: 30, onClick: () => {
                                        console.log("Export Ex");
                                    } }, void 0)] }), void 0)] }, void 0), _jsxs(Table, Object.assign({ striped: true, bordered: true, hover: true }, { children: [_jsx("thead", { children: _jsx("tr", { children: headerPrint() }, void 0) }, void 0), options.columnSearch === true ? (_jsx("thead", { children: _jsx("tr", { children: headerSearchPrint() }, void 0) }, void 0)) : null, _jsxs("tbody", { children: [!isLoading ? (dataList()) : (_jsx("tr", Object.assign({ style: { textAlign: "center" } }, { children: _jsx("td", Object.assign({ colSpan: columns.length }, { children: _jsx(Spinner, { animation: "border", role: "status" }, void 0) }), void 0) }), void 0)), console.log(typeof totalData), !isLoading && totalData === 0 ? (_jsx("tr", Object.assign({ style: { textAlign: "center" } }, { children: _jsx("td", Object.assign({ colSpan: columns.length }, { children: "No Data Found" }), void 0) }), void 0)) : null] }, void 0)] }), void 0)] }, void 0) }, void 0));
};
export default BackendTable;
//# sourceMappingURL=index.js.map