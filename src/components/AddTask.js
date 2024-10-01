import React, { useState } from 'react';
import PropTypes from 'prop-types';

const AddTask = ({ handleSave }) => {
    const [description, setDescription] = useState("");
    const [err,setErr] = useState("");

    const handleDescriptionChange = (event) => {
        setErr("");
        setDescription(event.target.value);
    };

    const handleSaveClick = () => {
        if (description.trim() !== "") {
            handleSave(description);
        }
        else {
            setErr("Enter Valid Task")
        }
    };

    return (
        <div className="form-main">
            <div className="form-entry">
                <p>Description:</p>
                <input
                    className="task"
                    value={description}
                    onChange={handleDescriptionChange}
                />
               { err ? <span style={{ color: 'red' }}>{err}</span> : "" }
            </div>
            <div className="form-action">
                <button className="" onClick={handleSaveClick}>Save</button>
            </div>
        </div>
    );
};



export default AddTask;
