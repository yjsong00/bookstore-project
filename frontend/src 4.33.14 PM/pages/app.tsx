import "../app/globals.css";

import { useState, useEffect, useCallback } from 'react'
import { BiCalendar } from "react-icons/bi"
import Search from "../components/Search"
import { NavComponent } from "../components/nav";
import Link from "next/link";
import { useAuth } from '../hooks/useAuth';

import BookstoreInfo from "../components/bookstorelist"
import ViewDetailPage from "../components/viewDetail"

export interface Bookstore{
  ESNTL_ID: string;
  FCLTY_NM: string;
  LCLAS_NM: string;
  MLSFC_NM: string;
  ZIP_NO: number;
  FCLTY_ROAD_NM_ADDR: string;
  FCLTY_LA: number;
  FCLTY_LO: number;
  WORKDAY_OPN_BSNS_TIME: string;
  WORKDAY_CLOS_TIME: string;
  SAT_OPN_BSNS_TIME: string;
  SAT_CLOS_TIME: string;
  SUN_OPN_BSNS_TIME: string;
  SUN_CLOS_TIME: string;
  RSTDE_OPN_BSNS_TIME: string;
  RSTDE_CLOS_TIME: string;
  RSTDE_GUID_CN: string;
  TEL_NO: number;
  OPTN_DC: string;
  ADIT_DC: string;
}

export type OrderBy = "asc" | "desc";

const App: React.FC = () => {
  const { isLoggedIn, userInfo, logout } = useAuth();

  const [bookstoreList, setBookstoreList] = useState<Bookstore[]>([]);
  const [query, setQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<keyof Bookstore>("FCLTY_NM");
  const [orderBy, setOrderBy] = useState<OrderBy>("asc");
  const [viewDetailToggle, setViewDetailToggle] = useState<Boolean>(false);

  const safeToLowerCase = (value: any): string => {
    if (typeof value === 'string') {
      return value.toLowerCase();
    }
    return '';
  };

  const filteredbookstores = bookstoreList.filter(
    stores => {
      return (
        safeToLowerCase(stores.FCLTY_NM).includes(query.toLowerCase()) ||
        safeToLowerCase(stores.LCLAS_NM).includes(query.toLowerCase()) ||
        // safeToLowerCase(stores.RSTDE_GUID_CN).includes(query.toLowerCase())
        safeToLowerCase(stores.OPTN_DC).includes(query.toLowerCase())

      )
    }
  ).sort((a, b) => {
    let order = (orderBy === 'asc') ? 1 : -1;
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.toLowerCase() < bValue.toLowerCase() ? -1 * order : 1 * order;
    } else {
      return aValue < bValue ? -1 * order : 1 * order;
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/bookstore.json');
        const data = await response.json();
        setBookstoreList(data);
      } catch (error) {
        console.error('Error fetching bookstore data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      

<NavComponent className="fixed z-[9999] mt-[-62px]" isLoggedIn={isLoggedIn} username={userInfo ? userInfo.username : ''} logout={logout}/>
    <div className="w-[95%] md:w-[80%] mx-auto mt-[62px] font-thin">
      <Search query={query}
        onQueryChange={(myQuery: string) => setQuery(myQuery)}
        orderBy={orderBy}
        onOrderByChange={(myOrder: OrderBy) => setOrderBy(myOrder)}
        sortBy={sortBy}
        onSortByChange={(mySort: keyof Bookstore) => setSortBy(mySort)}
        toggleShow={true}
      />

      <ul className="divide-y divide-gray-200">
        {filteredbookstores.map(bookstore => (
          <BookstoreInfo key={bookstore.ESNTL_ID} bookstores={bookstore} viewDetail={ViewDetailPage}/>
        ))}
      </ul>
    </div>
    
    </>
  );
}

export default App;