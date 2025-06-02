import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import "react-bootstrap";
import { Table, Card, Button, Pagination, Form, Row, Col, Spinner, } from "react-bootstrap";
import parse from 'html-react-parser';
import { BiExport, BiSortDown, BiSortUp } from "react-icons/bi";
import Select from 'react-select';
let timer = window.setTimeout(() => { });
const customStyle = {
    borderWidth: "1px",
    borderColor: "#e7ecf1"
};
const stickyHeaderStyle = {
    position: 'sticky',
    top: 0,
    backgroundColor: '#fff'
};
const BackendTable = forwardRef(({ columns, options }, ref) => {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState([]);
    const [totalData, setTotalData] = useState(0);
    const [totalExpenseAmount, setTotalExpenseAmount] = useState(0);
    let initialPostData = {
        globalSearch: "",
        limit: 10,
        offset: 0,
        orderBy: options.orderBy,
        orderType: options.orderType,
        columns: {},
    };
    columns.forEach((v) => {
        initialPostData.columns[v.field] = {
            filterType: "",
            filterValue: "",
        };
    });
    const [paginationData, setPaginationData] = useState({
        paginationStartWith: 1,
        currentPage: 1,
        perPageData: options.perPage[0],
        globalSearch: "",
    });
    const [globalSearchText, setGlobalSearch] = useState("");
    const [postData, setPostData] = useState(initialPostData);
    useEffect(() => {
        fetchEntities();
    }, [paginationData, postData]);
    const setColumnSearchData = (key, value) => {
        postData.columns[key].filterValue = value;
        postData.columns[key].filterType = "like";
        setPostData(Object.assign({}, postData));
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
        items.push(_jsx(Pagination.First, { disabled: previousFirstDisable, onClick: () => setPaginationData(Object.assign(Object.assign({}, paginationData), { currentPage: 1, paginationStartWith: 1 })) }, "first"));
        items.push(_jsx(Pagination.Prev, { disabled: previousFirstDisable, onClick: () => {
                if (paginationData.currentPage !== 1) {
                    setPaginationData(Object.assign(Object.assign({}, paginationData), { currentPage: paginationData.currentPage - 1, paginationStartWith: paginationData.paginationStartWith - 1 }));
                }
            } }, "prev"));
        for (let number = paginationData.paginationStartWith; pagePrint >= 1; number++) {
            pagePrint--;
            items.push(_jsx(Pagination.Item, { active: number === paginationData.currentPage, onClick: () => setPaginationData(Object.assign(Object.assign({}, paginationData), { currentPage: number })), children: number }, number));
        }
        items.push(_jsx(Pagination.Next, { disabled: nextlastDisable, onClick: () => {
                if (paginationData.currentPage < totalPage)
                    setPaginationData(Object.assign(Object.assign({}, paginationData), { currentPage: paginationData.currentPage + 1, paginationStartWith: paginationData.paginationStartWith + 1 }));
            } }, "next"));
        items.push(_jsx(Pagination.Last, { disabled: nextlastDisable, onClick: () => setPaginationData(Object.assign(Object.assign({}, paginationData), { currentPage: totalPage, paginationStartWith: totalPage - 4 })) }, "last"));
        return items;
    };
    const makePerPageSelectBox = () => {
        return options.perPage.map((v, k) => (_jsx("option", { value: v, children: v }, k)));
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
        Object.entries(postData.columns).forEach(([k, v]) => {
            searchParams.append(`columns[${k}][0][filterType]`, v.filterType);
            searchParams.append(`columns[${k}][0][filterValue]`, v.filterValue);
        });
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
            const requestHeaders = new Headers();
            requestHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
            if (options.authorization)
                requestHeaders.append('Authorization', options.authorization);
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
        return data.map((value, key) => (_jsx("tr", { children: columns.map((v, k) => {
                if (v.hasComponent)
                    return _jsx("td", { className: v.tdClass, style: v.tdStyle, children: v.componentValue(value) }, k);
                if (v.hasHtml)
                    return _jsx("td", { className: v.tdClass, style: v.tdStyle, children: parse(v.htmlValue(value)) }, k);
                return _jsx("td", { className: v.tdClass, style: v.tdStyle, children: value[v.field] }, k);
            }) }, key)));
    };
    const headerPrint = () => columns.map((column, index) => (_jsxs("th", { className: column.thClass, style: column.thStyle, onClick: () => {
            if (column.sortable) {
                setPostData(Object.assign(Object.assign({}, postData), { orderBy: column.field, orderType: postData.orderType === "asc" ? "desc" : "asc" }));
            }
        }, children: [column.title, column.field === postData.orderBy && (postData.orderType === "asc"
                ? _jsx(BiSortUp, { className: "float-right", size: 20 })
                : _jsx(BiSortDown, { className: "float-right", size: 20 }))] }, index)));
    const headerSearchPrint = () => columns.map((column, index) => {
        if (!column.searchable)
            return _jsx("th", {}, index);
        if (column.isMultiSelect && column.selectOptions) {
            return (_jsx("th", { children: _jsx(Select, { isMulti: true, options: column.selectOptions, className: "form-control-sm", placeholder: column.placeholder || "Select ...", onChange: (selected) => {
                        const values = selected.map((opt) => opt.value).join("!");
                        setColumnSearchData(column.field, values);
                    }, styles: { control: (base) => (Object.assign(Object.assign({}, base), { width: column.searchBarWidth })) } }) }, index));
        }
        else if (column.isSelect && column.selectOptions) {
            return (_jsx("th", { children: _jsx(Select, { options: column.selectOptions, className: "form-control-sm", placeholder: column.placeholder || "Select ...", onChange: (opt) => opt && setColumnSearchData(column.field, opt.value), styles: { control: (base) => (Object.assign(Object.assign({}, base), { width: column.searchBarWidth })) } }) }, index));
        }
        else {
            return (_jsx("th", { children: _jsx(Form.Control, { type: "text", size: "sm", name: column.field, placeholder: column.placeholder || "Search ...", onChange: (e) => setColumnSearchData(e.target.name, e.target.value) }) }, index));
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
    const exportToCsv = (filename, rows) => {
        let processRow = (row) => {
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
    return (_jsx(Card, { children: _jsxs(Card.Body, { children: [_jsx(Row, { children: _jsx(Col, { md: "4", children: _jsx(Card.Title, { children: options.title }) }) }), _jsxs(Row, { children: [_jsx(Col, { md: "1", children: _jsx(Form.Select, { size: "sm", value: paginationData.perPageData, onChange: (e) => setPaginationData(Object.assign(Object.assign({}, paginationData), { perPageData: e.target.value, currentPage: 1, paginationStartWith: 1 })), children: makePerPageSelectBox() }) }), _jsxs(Col, { md: "2", children: [" of ", totalData] }), _jsx(Col, { md: "4", children: _jsx(Pagination, { size: "sm", children: makePagination() }) }), _jsxs(Col, { md: "5", children: [_jsx(Form.Control, { style: { width: "70%", display: "inline" }, type: "text", placeholder: "Search ...", size: "sm", onChange: (e) => setGlobalSearch(e.target.value) }), _jsx(Button, { variant: "success", size: "sm", style: { marginLeft: "10px" }, onClick: () => setPaginationData(Object.assign(Object.assign({}, paginationData), { globalSearch: globalSearchText, currentPage: 1, paginationStartWith: 1 })), children: "Show" }), _jsx(BiExport, { size: 30, style: { marginLeft: "5px" }, onClick: exportData })] })] }), totalExpenseAmount > 0 && (_jsx(Row, { children: _jsxs("h4", { children: ["Total Expense Amount: ", totalExpenseAmount] }) })), _jsxs(Table, { striped: true, bordered: true, hover: true, responsive: true, style: { marginTop: "10px" }, children: [_jsxs("thead", { style: stickyHeaderStyle, children: [_jsx("tr", { children: headerPrint() }), options.columnSearch && _jsx("tr", { children: headerSearchPrint() })] }), _jsxs("tbody", { style: customStyle, children: [!isLoading ? dataList() : (_jsx("tr", { children: _jsx("td", { colSpan: columns.length, children: _jsx(Spinner, { animation: "border" }) }) })), !isLoading && totalData === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: columns.length, children: "No Data Found" }) }))] })] })] }) }));
});
export default React.memo(BackendTable);
//# sourceMappingURL=index.js.map