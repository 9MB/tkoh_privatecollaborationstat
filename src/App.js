import './App.css';
import { useState, useEffect, useRef } from 'react';
import { doc, setDoc, query, collection, getDocs, getDoc } from "firebase/firestore";
import Button from 'react-bootstrap/Button';
import { db } from './index';
import SummaryTable from './Components/SummaryTable';
import Spinner from 'react-bootstrap/Spinner'
import Last7DaysTable from './Components/Last7DaysTable';

export const specialtiesArray = ["AandE", "AandOT", "MED", "ORTGYN", "SUR"];

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

  async function updateDepartment(department) {
    const departmentRef = doc(db, 'Departments', department);
    const BH_count = parseInt(document.getElementById(`${department}bh_count`).value);
    const STH_count = parseInt(document.getElementById(`${department}sth_count`).value);

    setDoc(departmentRef, {
      BH_count: BH_count,
      STH_count: STH_count,
      lastupdate: new Date().getTime(),
      total: STH_count + BH_count,
    },
      { merge: true })
      .then(() => {
        alert("Successfully update");
      })
      .finally(() => {
        window.location.reload();
      })
  }

  async function calculateStatistics() {
    const statisticsRef = doc(db, 'Statistics', 'StatisticsLog');
    var tmp_last7DaysArray = [...last7DaysArray];
    const today = new Date().toLocaleDateString('it');
    var dailyTotal = 0;
    var dailyBHTotal = 0;
    var dailySTHTotal = 0;
    fetchedDepartmentsStatus.forEach(department => {
      dailyTotal = dailyTotal + department.total;
      dailyBHTotal = dailyBHTotal + department.BH_count;
      dailySTHTotal = dailySTHTotal + department.STH_count;
    });
    const dailyObject = {
      date: today,
      dailyTotal: dailyTotal,
      dailyBHTotal: dailyBHTotal,
      dailySTHTotal: dailySTHTotal
    }

    if (allDaysArray.current.length > 0 && allDaysArray.current[allDaysArray.current.length - 1].date === today) {
      allDaysArray.current.splice(-1, 1);
      allDaysArray.current.push(dailyObject);
    } else {
      allDaysArray.current.push(dailyObject)
    }

    if (tmp_last7DaysArray.length > 0 && tmp_last7DaysArray[tmp_last7DaysArray.length - 1].date === today) {
      tmp_last7DaysArray.splice(-1, 1);
      tmp_last7DaysArray.push(dailyObject);
    } else if (tmp_last7DaysArray.length === 7) {
      tmp_last7DaysArray.splice(0, 1);
      tmp_last7DaysArray.push(dailyObject);
    } else {
      tmp_last7DaysArray.push(dailyObject);
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
                <h3>Cases Transfer From Specialties to Private Today</h3>
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
                                  <h5>{ward.specialty.replace("and", "&")}</h5>
                                  <div className="BedCountColumn">
                                    <label for={`${ward.specialty}bh_count`} className="CounterLabel">Transfer to BH today:</label>
                                    <select className="covid_counter" id={`${ward.specialty}bh_count`} defaultValue={ward.BH_count}>
                                      {[...Array(50).keys()].map(option => {
                                        return (
                                          <option className="covid_counter_option" value={option}>{option}</option>
                                        )
                                      })}
                                    </select>
                                    <label for={`${ward.specialty}sth_count`} className="CounterLabel">Transfer to STH today:</label>
                                    <select className="covid_counter" id={`${ward.specialty}sth_count`} defaultValue={ward.STH_count}>
                                      {[...Array(50).keys()].map(option => {
                                        return (
                                          <option className="covid_counter_option" value={option}>{option}</option>
                                        )
                                      })}
                                    </select>
                                  </div>
                                  <Button variant="success" onClick={() => { updateDepartment(ward.specialty) }}>Update</Button>
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
