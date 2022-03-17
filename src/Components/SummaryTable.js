import Table from 'react-bootstrap/Table';
import { specialtiesArray } from '../App';
import { useState } from 'react';

export default function SummaryTable(props) {
    const [currentSummaryTableDate, setCurrentSummaryTableDate] = useState(new Date().toDateString());
    return (
        <>
            <Table striped bordered hover variant="dark">
                <thead>
                    <tr>
                        <th>Specialty</th>
                        <th>BH</th>
                        <th>STH</th>
                        <th>CUMC</th>
                        <th>Total</th>
                        <th>Update</th>
                    </tr>
                </thead>
                <tbody>
                    {specialtiesArray.map((specialty, index) => {
                        return (
                            <tr>
                                <td>{props.fetchedData[index].specialty.replace("and", "&")}</td>
                                <td>{currentSummaryTableDate == new Date().toDateString() ? props.fetchedData[index].BH_count : props.fetchedData[index].pastHistory.filter(history => history.date === currentSummaryTableDate).length > 0 ? props.fetchedData[index].pastHistory.filter(history => history.date === currentSummaryTableDate)[0].BH_count : 0}</td>
                                <td>{currentSummaryTableDate == new Date().toDateString() ? props.fetchedData[index].STH_count : props.fetchedData[index].pastHistory.filter(history => history.date === currentSummaryTableDate).length > 0 ? props.fetchedData[index].pastHistory.filter(history => history.date === currentSummaryTableDate)[0].STH_count : 0}</td>
                                <td>{currentSummaryTableDate == new Date().toDateString() ? props.fetchedData[index].CUMC_count : props.fetchedData[index].pastHistory.filter(history => history.date === currentSummaryTableDate).length > 0 ? props.fetchedData[index].pastHistory.filter(history => history.date === currentSummaryTableDate)[0].CUMC_count : 0}</td>
                                <td>{currentSummaryTableDate == new Date().toDateString() ? props.fetchedData[index].total : props.fetchedData[index].pastHistory.filter(history => history.date === currentSummaryTableDate).length > 0 ? props.fetchedData[index].pastHistory.filter(history => history.date === currentSummaryTableDate)[0].total : 0}</td>
                                <td>{new Date(props.fetchedData[index].lastupdate).toLocaleDateString("it")}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </Table>
            <label id="SelectDateLabel" for="start">Select Date:</label>
            <input type="date" id="SelectDateInput" name="trip-start" defaultValue={new Date().toLocaleDateString('zu-ZA')} onChange={(event) => { setCurrentSummaryTableDate(new Date(event.target.value).toDateString()) }} />
        </>
    )
}