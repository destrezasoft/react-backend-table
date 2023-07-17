import * as React from 'react';
import { Columns, Options, columnFilter } from './src';

export interface LooseObject {
	[key: string]: columnFilter;
}
export interface Options {
	title: string;
	url: string;
	perPage: any[];
	orderBy: string;
	orderType: string;
	columnSearch: boolean;
	reloadMyTable?: any;
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