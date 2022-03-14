import Table from 'react-bootstrap/Table';


export default function Last7DaysTable(props){
    return (
        <>
            <Table striped bordered hover variant="light">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>BH</th>
                        <th>STH</th>
                        <th>CUMC</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {props.fetchedStatistics.map(dailyStat=>{
                        return(
                            <tr>
                                <td>{new Date(dailyStat.date).toLocaleDateString('it')}</td>
                                <td>{dailyStat.dailyBHTotal}</td>
                                <td>{dailyStat.dailySTHTotal}</td>
                                <td>{dailyStat.dailyCUMCTotal}</td>
                                <td>{dailyStat.dailyTotal}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </Table>
        </>
    )
}