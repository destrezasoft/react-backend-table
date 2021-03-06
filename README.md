
# React Backend Data Table 

> React Backend data table project build with react type script. All search filter sorting are call backend , data filter show from backend , global search columnsearch and sort are configureable . Its call a http post request after change frontend for new  data retrive 

## Prerequisite

This project requires NodeJS (version 14 or later) and NPM.
[Node](http://nodejs.org/) and [NPM](https://npmjs.org/) are really easy to install.
To make sure you have them available on your machine,
use react-bootstrap version  "^2.1.1" and react-icons version "^4.3.1"
try running the following command.


```sh
$ npm -v && node -v

```


## Getting Started

These instructions will help to install and usethis library 

## Installation

```sh
$ npm install react-backend-table

```



## Usage

### Import React Backend Table 

```tsx
import BackendTable from "react-backend-table";
import {LooseObject} from  "react-backend-table";

```


### Initialize Props Like an example 

```tsx
 let columns = [
    { title: "id", field: "id_users" ,sortable:true, searchable:true , thStyle:{width:100} },
    { title: "name", field: "username", sortable:true,  searchable:true },
    { title: "email", field: "email", sortable:true,  searchable:true },
    { title: "create date", field: "create_date", sortable:false },
    { 
      title: "Action",
      field: "action",
      sortable:false,
      searchable:false,
      hasComponent:true,
      componentValue:( (rowValue:LooseObject )=>{  return (<Button size={'sm'} onClick={()=>{ test( rowValue.name.toString() ); }}>Delete</Button>) })
    }
  ]
  let options = {
    title:"Hello Table",
    url:"Your Backend URL" ,//http://192.168.0.6/login_v2/Login/reactDataTable
    perPage:[10,20,50,100],
    orderBy:"id_users",
    orderType: "asc",
    columnSearch: true 
  }
```

### Finally load your componnent 

```tsx
   <BackendTable columns={columns} options={options} />
```

### Full Example Bellow 

```tsx
import BackendTable from "react-backend-table";
import {LooseObject} from  "react-backend-table";
import { Button } from "react-bootstrap";

function App() {
  let columns = [
    { title: "id", field: "id_users" ,sortable:true, searchable:true , thStyle:{width:100} },
    { title: "name", field: "username", sortable:true,  searchable:true },
    { title: "email", field: "email", sortable:true,  searchable:true },
    { title: "create date", field: "create_date", sortable:false },
    { 
      title: "Action",
      field: "action",
      sortable:false,
      searchable:false,
      hasComponent:true,
      componentValue:( (rowValue:LooseObject )=>{  return (<Button size={'sm'} onClick={()=>{ test( rowValue.name.toString() ); }}>Delete</Button>) })
    }
  ]
  let options = {
    title:"Hello Table",
    url:"http://192.168.0.6/login_v2/Login/reactDataTable",
    perPage:[10,20,50,100],
    orderBy:"id_users",
    orderType: "asc",
    columnSearch: true 
  }

  return (
   <BackendTable columns={columns} options={options} />
  );
}

```
##  BACKEND API
All Data from Data Table will get as post data . this is a dummy backend code for use , 
Follow response value for work properly , "SQL_CALC_FOUND_ROWS" sql cluse use for get total easy way dont worry for that just find out total your won way
```js
    $filter = $this->input->post();		
		$this->db->select('SQL_CALC_FOUND_ROWS users.id_users AS `id_users`', FALSE);
		$this->db->select('username');
		$this->db->select('email');
		$this->db->select('create_date');
		$this->db->from('users');

		if($filter["globalSearch"]!= ""){
			$this->db->like("username",$filter["globalSearch"]);
		}
		if (!empty($filter["limit"])) {
			$this->db->limit($filter["limit"], $filter["offset"]);
		} else {
			$this->db->limit(10, 0);
		}
		$query  = $this->db->get();
		$result = $query->result_array();
		$total = $this->db->query("SELECT FOUND_ROWS() AS `total`")->row()->total;
		echo json_encode(array('data' =>array("data"=>$result, "total"=> $total) ,"status"=>true));
```


## Credits
Destraza Soft 



## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).

## Authors

* **Ashaduz zaman **   
* **Adnan  Nuruddin **    

## License

destraza Software 