import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from './Checkbox';
import trash from '../images/trash.png';

const Task = ({ task, deleteTask }) => {
    // const toggleTaskStatusHandler = () => {
    //     const updatedTask = { ...task, completed: !task.completed };
    //     toggleTaskStatus(updatedTask);
    // };

    const deleteTaskHandler = () => deleteTask(task.id);

    const getDescriptionCss = (task) => {
        let cssClass = "float-left width-70 text-align-left";
        if (task.completed) {
            cssClass += " task-completed";
        }
        return cssClass;
    };

    return (
        <div className="task-item">
            {/* <div className="float-left width-15">
                <Checkbox isChecked={Boolean(task.completed)} handleCheckboxChange={toggleTaskStatusHandler} />
            </div> */}
            <div className={getDescriptionCss(task)}>
                {task.description}
            </div>
            <div className="float-left width-15">
                <img className="float-left clickable" src={trash} alt="delete" onClick={deleteTaskHandler} />
            </div>
            <div style={{ clear: 'both' }} />
        </div>
    );
};



export default Task;
