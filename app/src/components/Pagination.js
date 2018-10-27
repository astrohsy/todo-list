import React from 'react';

import './Pagination.css';

const sizeOfPages = 5;
const sideSize = Math.floor(sizeOfPages / 2);

const Pagination = ({todoCount, pageNumber, pageSize, onPageNumberChange}) => {
  const numberOfPages = Math.max(1, Math.ceil(todoCount / pageSize));

  const pages = [];

  const leftStart = pageNumber - sideSize;
  const rightEnd = pageNumber+sideSize
  const leftMargin = Math.max(leftStart, 1) - (leftStart);
  const rightMargin = rightEnd - Math.min(numberOfPages, rightEnd);

  const start = Math.max(leftStart - rightMargin, 1);
  const end = Math.min(numberOfPages, rightEnd + leftMargin);
  for (let i = start; i <= end; i++) {
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
        <li className="pagination-item">
          <a href="#0" className="pagination-number" onClick={onPageNumberChange.bind(this, pageNumber-1)}>
            ←<span className="pagination-control pagination-control-prev">prev</span>
          </a>
        </li>

          {pages}

        <li className="pagination-item">
          <a href="#0" className="pagination-number" onClick={onPageNumberChange.bind(this, pageNumber+1)}>
            <span className="pagination-control pagination-control-next">next</span>→
          </a>
        </li>
      </ul>
      
    </div>
  );
};

export default Pagination;