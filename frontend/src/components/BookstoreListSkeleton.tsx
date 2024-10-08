import React from 'react';

const BookstoreListSkeleton = ({ count = 3 }) => {
  return (
    <ul className="z-[100] divide-y divide-blue-100 py-4 px-4 w-[40%] rounded-2xl max-h-[600px] overflow-y-auto bg-white">
      {[...Array(count)].map((_, index) => (
        <li key={index} className="py-2 relative animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="absolute right-0 bottom-2 h-4 bg-gray-200 rounded w-20"></div>
        </li>
      ))}
    </ul>
  );
};

export default BookstoreListSkeleton;