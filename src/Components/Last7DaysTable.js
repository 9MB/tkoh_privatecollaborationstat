import Table from 'react-bootstrap/Table';


export default function Last7DaysTable(props){
    return (
        <>
            <Table striped bordered hover variant="light">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>STH</th>
                        <th>BH</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {props.fetchedStatistics.map(dailyStat=>{
                        return(
                            <tr>
                                <td>{dailyStat.date}</td>
                                <td>{dailyStat.dailySTHTotal}</td>
                                <td>{dailyStat.dailyBHTotal}</td>
                                <td>{dailyStat.dailyTotal}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </Table>
        </>
    )
}