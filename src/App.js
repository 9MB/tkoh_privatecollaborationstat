import './App.css';
import { useState, useEffect, useRef } from 'react';
import { doc, setDoc, query, collection, getDocs, getDoc } from "firebase/firestore";
import Button from 'react-bootstrap/Button';
import { db } from './index';
import SummaryTable from './Components/SummaryTable';
import Spinner from 'react-bootstrap/Spinner'
import Last7DaysTable from './Components/Last7DaysTable';

export const specialtiesArray = ["AandE", "AandOT", "MED", "ORTGYN", "SUR"];
var currentSelectedDate = new Date().toDateString();

function App() {
  const [logIn, setLogIn] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [summaryPage, switchSummaryPage] = useState(true);
  const [showSpecialty, setShowSpecialty] = useState("");
  const [fetchedDepartmentsStatus, setFetchedDepartmentsStatus] = useState([]);
  const [last7DaysArray, setLast7DaysArray] = useState([]);

  const allDaysArray = useRef([]);

  useEffect(() => {
    loadLogIn();
    getStatisticsFile();
    fetchDepartmentsStatus();
  }, []);

  useEffect(() => {
    if (fetchedDepartmentsStatus.length > 0) {
      calculateStatistics();
    }
  }, [fetchedDepartmentsStatus]);

  function login(event) {
    event.preventDefault();
    if (username === "tkoh_admin" && password === "admin123") {
      setLogIn("Sudo");
      sessionStorage.setItem("User", "Sudo");
    } else if (username === "tkoh_ward" && password === "ward123") {
      setLogIn("Read");
      sessionStorage.setItem("User", "Read");
    } else {
      alert("Incorrect Username or Password");
      setUsername("");
      setPassword("");
    }
  }

  function loadLogIn() {
    const cookie = sessionStorage.getItem("User");
    setLogIn(cookie);
  }

  async function updateDepartment(department, pastHistory) {
    var tmp_pastHistory = pastHistory;
    const departmentRef = doc(db, 'Departments', department);
    const BH_count = parseInt(document.getElementById(`${department}bh_count`).value);
    const STH_count = parseInt(document.getElementById(`${department}sth_count`).value);
    const CUMC_count = parseInt(document.getElementById(`${department}cumc_count`).value);
    const today = new Date().toDateString();
    const historyObject = {
      date: today,
      BH_count: BH_count,
      STH_count: STH_count,
      CUMC_count: CUMC_count,
      total: BH_count + STH_count + CUMC_count
    }

    if (tmp_pastHistory.length > 0 && tmp_pastHistory[tmp_pastHistory.length - 1].date === today) {
      tmp_pastHistory.splice(-1, 1);
      tmp_pastHistory.push(historyObject);
    } else {
      tmp_pastHistory.push(historyObject);
    }

    setDoc(departmentRef, {
      BH_count: BH_count,
      STH_count: STH_count,
      CUMC_count: CUMC_count,
      lastupdate: new Date().getTime(),
      total: STH_count + BH_count + CUMC_count,
      pastHistory: tmp_pastHistory
    },
      { merge: true })
      .then(() => {
        window.location.reload();
      })
  }

  async function updateHistory(department, pastHistory) {
    var tmp_pastHistory = pastHistory;
    const departmentRef = doc(db, 'Departments', department);
    const statisticsRef = doc(db, 'Statistics', 'StatisticsLog');
    var tmp_last7DaysArray = [...last7DaysArray];
    var tmp_allDays = [...allDaysArray.current]
    var tmp_last7DaysSelectedDate = [...last7DaysArray].filter(history => history.date === currentSelectedDate)[0];

    const selectedPastHistory = pastHistory.filter(history => history.date === currentSelectedDate)[0];
    const BH_count = parseInt(document.getElementById(`${department}bh_count`).value);
    const STH_count = parseInt(document.getElementById(`${department}sth_count`).value);
    const CUMC_count = parseInt(document.getElementById(`${department}cumc_count`).value);
    const BH_diff = BH_count - parseInt(selectedPastHistory.BH_count);
    const STH_diff = STH_count - parseInt(selectedPastHistory.STH_count);
    const CUMC_diff = CUMC_count - parseInt(selectedPastHistory.CUMC_count);
    const total_diff = BH_diff + STH_diff + CUMC_diff;
    console.log("Diff", BH_diff, STH_diff, CUMC_diff, total_diff);

    console.log("tmp_last7days", tmp_last7DaysSelectedDate);
    tmp_last7DaysSelectedDate.dailyTotal = tmp_last7DaysSelectedDate.dailyTotal + total_diff;
    tmp_last7DaysSelectedDate.dailyBHTotal = tmp_last7DaysSelectedDate.dailyBHTotal + BH_diff;
    tmp_last7DaysSelectedDate.dailySTHTotal = tmp_last7DaysSelectedDate.dailySTHTotal + STH_diff;
    tmp_last7DaysSelectedDate.dailyCUMCTotal = tmp_last7DaysSelectedDate.dailyCUMCTotal + CUMC_diff;
    console.log("tmp_last7days", tmp_last7DaysSelectedDate);

    const indexOfStatHistory = tmp_last7DaysArray.findIndex(history => history.date === currentSelectedDate);
    tmp_last7DaysArray.splice(indexOfStatHistory, 1, tmp_last7DaysSelectedDate);
    const indexOfStatAllDaysHistory = tmp_allDays.findIndex(history => history.date === currentSelectedDate);
    tmp_allDays.splice(indexOfStatAllDaysHistory, 1, tmp_last7DaysSelectedDate);

    const historyObject = {
      date: currentSelectedDate,
      BH_count: BH_count,
      STH_count: STH_count,
      CUMC_count: CUMC_count
    }
    const indexOfDepartmentHistory = tmp_pastHistory.findIndex(history => history.date === currentSelectedDate);
    tmp_pastHistory.splice(indexOfDepartmentHistory, 1, historyObject);

    setDoc(departmentRef, {
      pastHistory: tmp_pastHistory
    },
      { merge: true })
      .then(() => {
        setDoc(statisticsRef, {
          last_seven_days: tmp_last7DaysArray,
          all_days: tmp_allDays
        },
          { merge: true })
          .then(() => {
            window.location.reload();
          })
      })

  }

  async function calculateStatistics() {
    const statisticsRef = doc(db, 'Statistics', 'StatisticsLog');
    var tmp_last7DaysArray = [...last7DaysArray];
    const today = new Date().toDateString();
    var dailyTotal = 0;
    var dailyBHTotal = 0;
    var dailySTHTotal = 0;
    var dailyCUMCTotal = 0;
    fetchedDepartmentsStatus.forEach(department => {
      dailyTotal = dailyTotal + department.total;
      dailyBHTotal = dailyBHTotal + department.BH_count;
      dailySTHTotal = dailySTHTotal + department.STH_count;
      dailyCUMCTotal = dailyCUMCTotal + department.CUMC_count;
    });
    const dailyObject = {
      date: today,
      dailyTotal: dailyTotal,
      dailyBHTotal: dailyBHTotal,
      dailySTHTotal: dailySTHTotal,
      dailyCUMCTotal: dailyCUMCTotal
    }

    const newDailyObject = {
      date: today,
      dailyTotal: 0,
      dailyBHTotal: 0,
      dailySTHTotal: 0,
      dailyCUMCTotal: 0
    }

    if (allDaysArray.current.length > 0 && new Date(allDaysArray.current[allDaysArray.current.length - 1].date).toDateString() == today) {
      allDaysArray.current.splice(-1, 1);
      allDaysArray.current.push(dailyObject);
    } else {
      allDaysArray.current.push(dailyObject)
    }

    if (tmp_last7DaysArray.length > 0 && new Date(tmp_last7DaysArray[tmp_last7DaysArray.length - 1].date).toDateString() == today) {
      tmp_last7DaysArray.splice(-1, 1);
      tmp_last7DaysArray.push(dailyObject);
    } else if (tmp_last7DaysArray.length === 7 && new Date(tmp_last7DaysArray[tmp_last7DaysArray.length - 1].date).toDateString() != today) {
      tmp_last7DaysArray.splice(0, 1);
      tmp_last7DaysArray.push(newDailyObject);
      fetchedDepartmentsStatus.forEach(department => {
        const departmentRef = doc(db, 'Departments', department);
        let tmp_pastHistory = department.pastHistory;
        tmp_pastHistory.push({
          BH_count: 0,
          STH_count: 0,
          CUMC_count: 0,
          total: 0,
          date: today
        })
        setDoc(departmentRef, {
          BH_count: 0,
          STH_count: 0,
          CUMC_count: 0,
          total: 0,
          lastupdate: new Date().getTime(),
          pastHistory: tmp_pastHistory
        })
      })
    } else {
      tmp_last7DaysArray.push(newDailyObject);
      fetchedDepartmentsStatus.forEach(department => {
        const departmentRef = doc(db, 'Departments', department);
        let tmp_pastHistory = department.pastHistory;
        tmp_pastHistory.push({
          BH_count: 0,
          STH_count: 0,
          CUMC_count: 0,
          total: 0,
          date: today
        })
        setDoc(departmentRef, {
          BH_count: 0,
          STH_count: 0,
          CUMC_count: 0,
          total: 0,
          lastupdate: new Date().getTime(),
          pastHistory: tmp_pastHistory
        })
      })
    }
    setLast7DaysArray([...tmp_last7DaysArray]);
    console.log(tmp_last7DaysArray);
    setDoc(statisticsRef, {
      last_seven_days: tmp_last7DaysArray,
      all_days: allDaysArray.current
    },
      { merge: true })
  }



  async function fetchDepartmentsStatus() {
    const q = query(collection(db, "Departments"));
    var tmpWardsStatus = [];
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      const wardIDObject = { specialty: doc.id };
      const wardContentObject = doc.data();
      const mergedObject = Object.assign(wardContentObject, wardIDObject);
      tmpWardsStatus.push(mergedObject);
    });
    console.log("tmp_WardsStatus", tmpWardsStatus)
    setFetchedDepartmentsStatus([...tmpWardsStatus]);
  }

  async function getStatisticsFile() {
    const docRef = doc(db, "Statistics", "StatisticsLog");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      allDaysArray.current = docSnap.data().all_days;
      setLast7DaysArray([...docSnap.data().last_seven_days]);
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  }

  function viewHistory(dateString, department, pastHistory) {
    currentSelectedDate = new Date(dateString).toDateString();
    const selectedDateHistory = pastHistory.filter(history => history.date === dateString)[0];
    if (selectedDateHistory !== undefined) {
      document.getElementById(`${department}bh_count`).value = !isNaN(selectedDateHistory.BH_count) ? selectedDateHistory.BH_count : 0;
      document.getElementById(`${department}sth_count`).value = !isNaN(selectedDateHistory.STH_count) ? selectedDateHistory.STH_count : 0;
      document.getElementById(`${department}cumc_count`).value = !isNaN(selectedDateHistory.CUMC_count) ? selectedDateHistory.CUMC_count : 0;
    } else {
      document.getElementById(`${department}bh_count`).value = 0;
      document.getElementById(`${department}sth_count`).value = 0;
      document.getElementById(`${department}cumc_count`).value = 0;
    }
  }



  return (
    <div className="App">
      {logIn === null || logIn === "" ? (
        <div id="LoginPanel">
          <form id="LoginForm" onSubmit={(event) => login(event)}>
            <h1>TKOH Private Hospital Collaboration Programme</h1>
            <input id="username" className="LoginInput" autoCapitalize='off' placeholder="Username" value={username} onChange={(event) => { setUsername(event.target.value) }} />
            <input id="password" type="password" className="LoginInput" placeholder="Password" value={password} onChange={(event) => { setPassword(event.target.value) }} />
            <Button id="LoginButton" variant="success" type="submit">Login</Button>
          </form>
        </div>
      ) : (
        fetchedDepartmentsStatus.length > 0 ? (
          <>
            <h1>TKOH Private Hospital Programme</h1>
            <div id="RefreshRow">
              {sessionStorage.getItem("LastUpdateTime") ? (
                <h5>Last refresh:{`${new Date(sessionStorage.getItem("LastUpdateTime")).getHours() < 10 ? '0' + new Date(sessionStorage.getItem("LastUpdateTime")).getHours() : new Date(sessionStorage.getItem("LastUpdateTime")).getHours()}:${new Date(sessionStorage.getItem("LastUpdateTime")).getMinutes() < 10 ? '0' + new Date(sessionStorage.getItem("LastUpdateTime")).getMinutes() : new Date(sessionStorage.getItem("LastUpdateTime")).getMinutes()}`}</h5>
              ) : null}
              <Button
                variant="warning"
                title="Manageable"
                className="mb-3 mr-3"
                onClick={() => {
                  sessionStorage.setItem("LastUpdateTime", new Date())
                  sessionStorage.setItem("User", logIn);
                  window.location.reload();
                }}
              >
                Refresh
              </Button>
              {logIn === "Sudo" ? (
                <>
                  <Button
                    variant="secondary"
                    title="Manageable"
                    className="mb-3 ml-3"
                    onClick={() => {
                      window.location.reload();
                    }}
                  >
                    List
                  </Button>
                  <Button
                    variant="secondary"
                    title="Manageable"
                    className="mb-3 ml-3"
                    onClick={() => {
                      switchSummaryPage(false);
                    }}
                  >
                    Edit
                  </Button>
                </>
              ) : null}

            </div>
            {summaryPage ? (
              <>
                <h3>Last 7 Days Report</h3>
                <Last7DaysTable fetchedStatistics={last7DaysArray} />
                <br />
                <h3>Cases Transfer From TKOH to Private Hospital Today</h3>
                <SummaryTable fetchedData={fetchedDepartmentsStatus} />
              </>
            ) : (
              <>
                {specialtiesArray.map(specialty => {
                  return (
                    <>
                      <button className="SpecialtyRowsShowButton" onClick={() => { setShowSpecialty(specialty) }}>{specialty.replace("and", "&")}</button>
                      {showSpecialty === specialty ? (
                        <div className="SpecialtyRows">
                          {fetchedDepartmentsStatus.filter(department => department.specialty === specialty).map(ward => {
                            return (
                              <>
                                <div className="SpecialtyRow">
                                  <div className="BedCountColumn">
                                    <div className="Row">
                                      <label for={`${ward.specialty}bh_count`} className="CounterLabel">BH:</label>
                                      <select className="covid_counter" id={`${ward.specialty}bh_count`} defaultValue={ward.BH_count}>
                                        {[...Array(50).keys()].map(option => {
                                          return (
                                            <option className="covid_counter_option" value={option}>{option}</option>
                                          )
                                        })}
                                      </select>
                                    </div>
                                    <div className="Row">
                                      <label for={`${ward.specialty}sth_count`} className="CounterLabel">STH:</label>
                                      <select className="covid_counter" id={`${ward.specialty}sth_count`} defaultValue={ward.STH_count}>
                                        {[...Array(50).keys()].map(option => {
                                          return (
                                            <option className="covid_counter_option" value={option}>{option}</option>
                                          )
                                        })}
                                      </select>
                                    </div>
                                    <div className="Row">
                                      <label for={`${ward.specialty}cumc_count`} className="CounterLabel">CUMC:</label>
                                      <select className="covid_counter" id={`${ward.specialty}cumc_count`} defaultValue={ward.CUMC_count}>
                                        {[...Array(50).keys()].map(option => {
                                          return (
                                            <option className="covid_counter_option" value={option}>{option}</option>
                                          )
                                        })}
                                      </select>
                                    </div>
                                    <label id="SelectDateLabel" for="start">Select Date:</label>
                                    <input type="date" id="SelectDateInput" name="trip-start" defaultValue={new Date().toLocaleDateString('zu-ZA')} onChange={(event) => { viewHistory(event.target.value, ward.specialty, ward.pastHistory) }} />
                                  </div>
                                  <Button variant="success" onClick={() => { currentSelectedDate === new Date().toDateString() ? updateDepartment(ward.specialty, ward.pastHistory) : updateHistory(ward.specialty, ward.pastHistory) }}>Update</Button>
                                </div>
                                <div className="InfoRow">
                                  <h5>Last Update @ {new Date(ward.lastupdate).toLocaleString()}</h5>
                                </div>
                                <hr />
                              </>
                            )
                          })}
                        </div>
                      ) : null}
                    </>
                  )
                })}
              </>
            )}
          </>
        ) : <>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </>
      )}
    </div>
  );
}

export default App;
