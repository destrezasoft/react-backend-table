import * as React from 'react';

export interface LooseObject {
	[key: string]: column;
}

interface Columns {
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

interface Options {
	title: string;
	url: string;
	perPage: number[];
	orderBy: string;
	orderType: string;
	columnSearch: boolean;
}

export interface BackendTableProps {
	columns: Columns[];
	options: Options;
}

declare class BackendTable extends React.Component<BackendTableProps> {
}

declare module 'backend-table' {
}

export default BackendTable;