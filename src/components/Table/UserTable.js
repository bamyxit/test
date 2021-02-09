import React ,{useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';

import { useHistory } from "react-router-dom";
import { useSnackbar } from "notistack";

export default function UserTable(props) {
  const useStyles = makeStyles((theme) => ({
    root: {
      width: '100%',
    },
    paper: {
      width: '100%',
      marginBottom: theme.spacing(2),
    },
    table: {
      minWidth: 750,
    },
    visuallyHidden: {
      border: 0,
      clip: 'rect(0 0 0 0)',
      height: 1,
      margin: -1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      top: 20,
      width: 1,
    },
  }));

  const rows = [
    createData('John ', 'Doe', 'john@doe.com', 'Male', true, 55, 10, 'Help',)

  ];
  
  const classes = useStyles();
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('type');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [optionShow, setOptionShow] = useState(false);
  const [menuShow, setMenuShow] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [refetch, setRefetch] = useState(true);
  const [data, setData] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const history = useHistory();

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };
  const hanleOPtionMenuClick = (event) => {
      setMenuShow(true);
  }

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
    props.setShowModal(true);
    props.setModalPage("user__details");
    props.setModalId("1")
     
      
  };
  const handleUserModal = () => {
    props.setShowModal(true);
    props.setModalPage("user__details");
    props.setModalId("1") 
    //props.setModalId(row.id)
  }
  const handleUserQuest = () => {
    props.setShowModal(true);
    props.setModalPage("assignQuest");
    props.setModalId("2") 
  }
  const handleUserDelete = () => {
    // props.setShowModal(true);
    // props.setModalPage("userDelete");
    // props.setModalId("3") 
  }
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  const isSelected = (name) => selected.indexOf(name) !== -1;

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);
  
  

  function createData(name, surname, email, gender, connectedToMh, currentScore, questCompleted, category) {
    return { name, surname, email, gender, connectedToMh, currentScore, questCompleted, category };
  }
  
  
  function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }
  
  function getComparator(order, orderBy) {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }
  
  function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }
  
  const headCells = [
    { id: 'name', numeric: false, disablePadding: true, label: 'Name' },
    { id: 'surname', numeric: false, disablePadding: false, label: 'Surname' },
    { id: 'email', numeric: false, disablePadding: false, label: 'Email' },
    { id: 'gender', numeric: false, disablePadding: false, label: 'Gender' },
    { id: 'connectedToMh', numeric: true, disablePadding: false, label: 'Connected To Mh' },
    { id: 'currentScore', numeric: true, disablePadding: false, label: 'Current Score' },
    { id: 'questCompleted', numeric: true, disablePadding: false, label: 'Quest Completed' },
    { id: 'category', numeric: false, disablePadding: false, label: 'Category' },
  ];
  
  useEffect(() => {
    if (refetch) {
      fetch(`${process.env.REACT_APP_API_URL}/admin/users`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (res.status === 401) {
            enqueueSnackbar(
              "Your session expired or you don't have admin rights",
              { variant: "error" }
            );
            localStorage.removeItem("MS_loggedIn");
            history.push("/");
          }
          return res.json();
        })
        .then((res) => {
          setData(res);
          setRefetch(false);
        })
        .catch((err) => {
          console.error("Error in fetch:", err);
        });
    }
  }, [refetch]);

  function EnhancedTableHead(props) {
    const { classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
    const createSortHandler = (property) => (event) => {
      onRequestSort(event, property);
    };
  
    return (
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{ 'aria-label': 'select all titles' }}
            />
          </TableCell>
          {headCells.map((headCell) => (
            <TableCell
              key={headCell.id}
              align={headCell.numeric ? 'right' : 'left'}
              padding={headCell.disablePadding ? 'none' : 'default'}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <span className={classes.visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </span>
                ) : null}
              </TableSortLabel>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  }
  
  const propTypes = {
    classes: PropTypes.object.isRequired,
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
  };
  
  const useToolbarStyles = makeStyles((theme) => ({
    root: {
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(1),
    },
    highlight:
      theme.palette.type === 'light'
        ? {
            color: theme.palette.secondary.main,
            backgroundColor: lighten(theme.palette.secondary.light, 0.85),
          }
        : {
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.secondary.dark,
          },
    title: {
      flex: '1 1 100%',
    },
    fab: {
      position: "absolute",
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    },
 
    
  }));
  
  const EnhancedTableToolbar = (props) => {
    const classes = useToolbarStyles();
    const { numSelected } = props;
  
    return (
      <Toolbar
        className={clsx(classes.root, {
          [classes.highlight]: numSelected > 0,
        })}
      >
        {numSelected > 0 ? (
          <>
          <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
            {numSelected} selected

          </Typography>

          <button type="button" className="btn btn-cool"><i class="far fa-trash-alt pr-2"
           onClick={handleUserDelete()}
          ></i>Delete</button>
           <button type="button" className="btn btn-dang"
           onClick={(event) => handleUserQuest(event)}
           ><i class="far fa-paper-plane  pr-2" aria-hidden="true"></i>Send</button>

           <div class="form-group has-search">
            <span class="fa fa-search form-control-feedback"></span>
            <input type="text" class="form-control" placeholder="Search users..."/>
        </div> 
        
          </>
          
        ) : (
          <>
          <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
            Users
          </Typography>
           <div class="form-group has-search">
            <span class="fa fa-search form-control-feedback"></span>
            <input type="text" class="form-control" placeholder="Search users..."/>
        </div> 
          </>
        )}

      </Toolbar>
    );
  };
  
  EnhancedTableToolbar.propTypes = {
    numSelected: PropTypes.number.isRequired,
  };
  
  
  return (
    
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <EnhancedTableToolbar numSelected={selected.length} />
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={data.length}
            />
            <TableBody>
              {stableSort(data, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user, index) => {
                  const isItemSelected = isSelected(user.email);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, user.email)}
                      
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={user.email}
                      selected={isItemSelected}
                       //onMouseEnter={() => handleUserModal()}
                      // onMouseLeave={() => setOptionShow(false)}
                  
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          inputProps={{ 'aria-labelledby': labelId }}
                        />
                      </TableCell>
                      <TableCell component="th" id={labelId} scope="row" padding="none">
                        {user.first_name}
                      </TableCell>
                      <TableCell >{user.last_name}</TableCell>
                      <TableCell >{user.email}</TableCell>
                      <TableCell >{user.gender}</TableCell>
                      {user.connected_to_mh == true ? 

                      <TableCell style={{color: 'green'}} > 
                       Yes 
                      </TableCell>

                      : 
                      <TableCell style={{color: 'red'}}>

                        No
                      </TableCell>
                      
                      }
                      <TableCell >{user.current_score}</TableCell>
                      <TableCell >{user.quests_completed}</TableCell>
                      <TableCell >{user.category}</TableCell>
                      {/* {optionShow && (

                      <div className="option"  onClick={() => hanleOPtionMenuClick()}>
                        <span>...</span>
                      </div>
                      )} */}
                      {/* {
                        menuShow && (

                      <div className="option__menu" onMouseLeave={setMenuShow(false)} >
                        <ul>
                          <li>Delete</li>
                          <li>Ban</li>
                          <li>Activate</li>
                        </ul>
                      </div>
                        )} */}
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                  <TableCell colSpan={11} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 20, 35]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
        {/* <Fab
        color="primary"
        aria-label="add"
        className={classes.fab}
        onClick={()=>{
          props.setShowModal(true);
          props.setModalPage("addquest")
        }}>
        <AddIcon />
        </Fab> */}
      </Paper>
    
    </div>
  );
}
