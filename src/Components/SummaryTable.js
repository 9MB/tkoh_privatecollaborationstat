import Table from 'react-bootstrap/Table';
import { specialtiesArray } from '../App';

export default function SummaryTable(props) {
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
                    {specialtiesArray.map((specialty, index)=>{
                        return(
                            <tr>
                                <td>{props.fetchedData[index].specialty.replace("and", "&")}</td>
                                <td>{props.fetchedData[index].BH_count}</td>
                                <td>{props.fetchedData[index].STH_count}</td>
                                <td>{props.fetchedData[index].CUMC_count}</td>
                                <td>{props.fetchedData[index].total}</td>
                                <td>{new Date(props.fetchedData[index].lastupdate).toLocaleDateString("it")}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </Table>
        </>
    )
}