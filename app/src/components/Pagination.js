import React from 'react';

import './Pagination.css';

const sizeOfPages = 5;
const sideSize = Math.floor(sizeOfPages / 2);

const Pagination = ({todoCount, pageNumber, pageSize, onPageNumberChange}) => {
  const numberOfPages = Math.max(1, Math.ceil(todoCount / pageSize));

  const pages = [];
  for (let i = Math.max(pageNumber - sideSize, 1); i <= Math.min(numberOfPages, pageNumber+sideSize); i++) {
    pages.push(
      <li key={i} className="pagination-item">
        <a href="#0" className={i === pageNumber ? "pagination-number pagination-number-active" : "pagination-number"}
          onClick={onPageNumberChange.bind(this, i)}
        >
          {i}
        </a>
      </li>
    )
  }

  return (
    <div className="pagination">
      <ul className="pagination pagination-circle">
        <li className="pagination-item"><a href="#0" className="pagination-number">
            ←<span className="pagination-control pagination-control-prev">prev</span>
          </a></li>

          {pages}

        <li className="pagination-item"><a href="#0" className="pagination-number">
          <span className="pagination-control pagination-control-next">next</span>→</a>
        </li>
      </ul>
      
    </div>
  );
};

export default Pagination;