import React,{useReducer,createContext} from 'react';

import contextReducer from './contextReducer'

//const initialState=[{amount:5,category:"Savings",type:'Income',date:'09-01-2021',id:'1'}];
const initialState=JSON.parse(localStorage.getItem('transactions')) || [{ amount: 500, category: 'Salary', type: 'Income', date: '2021-01-09', id: '7e10aba6-f1cc-4178-bce7-29a4f15b42dc ' }, { amount: 225, category: 'Investments', type: 'Income', date: '2021-01-09', id: '7e10aba6-f1cc-4178-bce7-29a4f15b42dc ' }, { amount: 50, category: 'Salary', type: 'Income', date: '2021-01-09', id: '7e10aba6-f1cc-4178-bce7-29a4f15b42dc ' }, { amount: 123, category: 'Car', type: 'Expense', date: '2021-01-09', id: '7e10aba6-f1cc-4178-bce7-29a4f15b42dc ' }, { amount: 50, category: 'Pets', type: 'Expense', date: '2021-01-09', id: '7e10aba6-f1cc-4178-bce7-29a4f15b42dc ' }, { amount: 500, category: 'Travel', type: 'Expense', date: '2021-01-09', id: '7e10aba6-f1cc-4178-bce7-29a4f15b42dc ' }, { amount: 50, category: 'Investments', type: 'Income', date: '2021-01-09', id: '7e10aba6-f1cc-4178-bce7-29a4f15b42dc ' }, { amount: 500, category: 'Savings', type: 'Income', date: '2021-01-09', id: '7e10aba6-f1cc-4178-bce7-29a4f15b42dc ' }, { amount: 5, category: 'Savings', type: 'Income', date: '2021-01-09', id: '7e10aba6-f1cc-4178-bce7-29a4f15b42dc ' }];


export const ExpenseTrackerContext=createContext(initialState);

export const Provider=({children})=>{
   const[transactions,dispatch]= useReducer(contextReducer,initialState);
    
   //Action Creators
   const deleteTransaction=(id)=>{
       dispatch({type:'DELETE_TRANSACTION',payload:id});
   }
   const addTransaction=(transaction)=>{
    dispatch({type:'ADD_TRANSACTION',payload:transaction});
    }

  //  console.log(transactions);
  const balance = transactions.reduce((acc, currVal) => (currVal.type === 'Expense' ? acc - currVal.amount : acc + currVal.amount), 0);
   return (
        <ExpenseTrackerContext.Provider value={{
          deleteTransaction,
          addTransaction,
          transactions,
          balance
        }}>
        {children}
        </ExpenseTrackerContext.Provider>
    )
}