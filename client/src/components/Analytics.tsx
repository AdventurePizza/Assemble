// @ts-nocheck
import React, { useEffect, useState, useContext } from 'react';
import { FirebaseContext } from "../firebaseContext";


export const Analytics = () => {
    const [todays, setTodays] = useState();
    const [lastWeek, setlastWeek] = useState();
    const [lastMonth, setlastMonth] = useState();
    const [thisWeekGoal, setThisWeekGoal] = useState();
    const [all, setAll] = useState();
    const [average, setAverage] = useState();
    const [total, setTotal] = useState();

    const { getVisit } = useContext(FirebaseContext);

    useEffect(() => {
        function calculateGoal(start, today) {
            //console.log("today")
            let goal = start;
            for (let i = 19124; i < today; i = i + 7) {
                goal = goal + Math.floor(goal * 0.06);
                //console.log("week " + (i / 7) + " : " + goal)
            }
            return goal;
        }

        async function fetchVisits() {
            const start = 1654026866; //april 21 
            const dayInterval = 86400000;
            let timestamp = Date.now();

            let dayIndex = (Math.floor((timestamp - start) / dayInterval)).toString();

            let result = await getVisit();
            console.log(result)
            setAll(result)

            let tempWeek = 0;
            let tempMonth = 0;
            let firstWeek = 0;

            let total = 0;
            result.forEach(element => {

                total += element.data.visits;
                if (dayIndex === element.id) {
                    setTodays(element.data.visits)
                }
                if (dayIndex - element.id >= 0 && dayIndex - element.id < 7) {
                    tempWeek += element.data.visits;
                }
                if (dayIndex - element.id >= 0 && dayIndex - element.id < 30) {
                    tempMonth += element.data.visits;
                }
                if (parseInt(element.id) >= 19124 && parseInt(element.id) < 19131) {
                    firstWeek += element.data.visits;
                }
            });

            setlastWeek(tempWeek);
            setlastMonth(tempMonth)
            setThisWeekGoal(calculateGoal(firstWeek, dayIndex))
            setTotal(total)
            setAverage(Math.floor(total / result.length))
        }
        fetchVisits();

    }, [getVisit]);

    return (
        <div style={{
            height: "100vh",
            fontSize: "1.4em"
            //, backgroundColor: "gray" 
        }}>
            <br></br>
            <h1>Visits</h1>
            Todays: {todays}
            <br></br>
            Last 7 days: {lastWeek}
            <br></br>
            Last 30 days: {lastMonth}
            <br></br>
            This week goal: {thisWeekGoal}
            <br></br>
            Total: {total}
            <br></br>
            Average: {average}
            <table style={{ border: "1px solid black" }}>
                <tr style={{ border: "1px solid black" }}>
                    <th>DAYS</th>
                    <th>VISITS</th>
                </tr>
                {all && all.map((day, index) => (

                    <tr >
                        <th>{index + 1}</th>
                        <th style={{ color: average > day.data.visits ? "red" : "green" }}>{day.data.visits}</th>
                    </tr>

                ))
                }
            </table>
        </div>
    );
}

