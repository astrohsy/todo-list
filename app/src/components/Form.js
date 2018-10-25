import React from 'react';
import './Form.css';

const Form = ({value, pageSize, onChange, onpageSizeChange, onCreate, onKeyPress}) => {
  return (
    <div className="form">
      <select value={pageSize} onChange={onpageSizeChange}> 
        <option value="5">5개</option>
        <option value="10">10개</option>
        <option value="25">25개</option>
        <option value="50">50개</option>
      </select>
      <input value={value} onChange={onChange} onKeyPress={onKeyPress}/>
      <div className="create-button" onClick={onCreate}>
        추가
      </div>
    </div>
  );
};

export default Form;