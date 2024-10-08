import { BiSearch, BiCaretDown, BiCheck } from "react-icons/bi"
import { useState } from 'react'
import { OrderBy } from '../pages/app'  // Import the Appointment interface and OrderBy type

import { Bookstore } from '../pages/app';

interface SearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  sortBy: keyof Bookstore;
  onSortByChange: (sort: keyof Bookstore) => void;
  orderBy: OrderBy;
  onOrderByChange: (order: OrderBy) => void;
  className?: string;
  toggleShow?: boolean;
}

interface DropDownProps {
  toggle: boolean;
  sortBy: keyof Bookstore;
  onSortByChange: (sort: keyof Bookstore) => void;
  orderBy: OrderBy;
  onOrderByChange: (order: OrderBy) => void;
}

const DropDown: React.FC<DropDownProps> = ({ toggle, sortBy, onSortByChange, orderBy, onOrderByChange }) => {
  if (!toggle) {
    return null;
  }
  return (
    <div className="origin-top-right absolute right-0 mt-2 w-56
    rounded-2xl shadow-lg bg-white ring-1 ring-black ring-opacity-5">
      <div className="py-1 rounded-2xl" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        <div onClick={() => onSortByChange('FCLTY_NM')}
          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex justify-between cursor-pointer"
          role="menuitem">책방 이름 {(sortBy === 'FCLTY_NM') && <BiCheck />}</div>
        <div onClick={() => onSortByChange('LCLAS_NM')}
          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex justify-between cursor-pointer"
          role="menuitem">대분류 {(sortBy === 'LCLAS_NM') && <BiCheck />}</div>
        <div onClick={() => onSortByChange('RSTDE_GUID_CN')}
          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex justify-between cursor-pointer"
          role="menuitem">공휴일 휴무 {(sortBy === 'RSTDE_GUID_CN') && <BiCheck />}</div>
        <div onClick={() => onOrderByChange('asc')}
          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex justify-between cursor-pointer border-gray-1 border-t-2"
          role="menuitem">위로 정렬 {(orderBy === 'asc') && <BiCheck />}</div>
        <div onClick={() => onOrderByChange('desc')}
          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex justify-between cursor-pointer"
          role="menuitem">아래로 정렬 {(orderBy === 'desc') && <BiCheck />}</div>
      </div>
    </div>
  )
}

const Search: React.FC<SearchProps> = ({ className, query, onQueryChange, sortBy, onSortByChange, orderBy, onOrderByChange, toggleShow}) => {
  let [toggleSort, setToggleSort] = useState(false)

  return (
    <div className={className}>
    <div className="py-5">
      <div className="mt-1 relative">
        <div className="absolute pt-2 left-0 pl-3 flex items-center pointer-events-none">
          {/* <BiSearch /> */}
          <label htmlFor="query" className="sr-only" />
        </div>
        <input type="text" name="query" id="query" value={query}
          onChange={(event) => { onQueryChange(event.target.value) }}
          className=" search-container rounded-2xl focus:ring-green-100 block w-full sm:text-md border-gray-300 border-b border-gray-200 focus:ring-2
          " />
        <div className="absolute inset-y-0 right-0 flex items-center">
          {/* <div className="">
          <button className="px-4 py-1 special-shadow rounded-2xl">
             AI에게 물어보기
          </button>
          </div> */}
          <div>

            <button type="button" onClick={() => { setToggleSort(!toggleSort) }}
              className={`${toggleShow === true ? 'flex' : 'hidden'} justify-center px-2 py-1 rounded-2xl bg-blue-400 border-2 border-blue-400 text-sm text-white hover:bg-blue-700 focus:outline-none focus:ring-2   items-center`} id="options-menu" aria-haspopup="true" aria-expanded="true">
              Sort By <BiCaretDown className="ml-2" />
            </button>
            <DropDown toggle={toggleSort}
              sortBy={sortBy}
              onSortByChange={onSortByChange}   
              orderBy={orderBy}
              onOrderByChange={onOrderByChange}
            />
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

export default Search