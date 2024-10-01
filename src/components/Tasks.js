import React from 'react';
import PropTypes from 'prop-types';
import Task from './Task';

const Tasks = ({ tasks, deleteTask }) => {
    const renderTasks = () => {
        return tasks.map(task => (
            <Task 
                key={task.id} 
                task={task} 
                // toggleTaskStatus={toggleTaskStatus} 
                deleteTask={deleteTask} 
            />
        ));
    };

    return (
        <div className="width-70 display-inline-block center">
            {renderTasks()}
        </div>
    );
};



export default Tasks;
