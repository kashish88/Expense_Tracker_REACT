import React, { useState, useEffect, useContext, useCallback } from 'react';
import { TextField, Grid, Typography, Button, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core'
import { ExpenseTrackerContext } from '../../../context/context'
import { v4 as uuidv4 } from 'uuid'
import formatDate from '../../../utils/formatDate'
import useStyles from './styles'
import { incomeCategories, expenseCategories } from '../../../constants/categories'
import { useSpeechContext } from '@speechly/react-client'
import CustomizedSnackbar from '../../Snackbar/Snackbar';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

const initialState = {
    amount: '',
    category: '',
    type: 'Income',
    date: formatDate(Date()),
}

const Form = () => {
    const classes = useStyles();
    const [formData, setFormData] = useState(initialState);
    const { addTransaction } = useContext(ExpenseTrackerContext);
    const { segment } = useSpeechContext();
    const [open, setOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);

    const handleCloseNotification = () => {
        setNotificationOpen(false);
    };

    const [budgets, setBudgets] = useState(
        expenseCategories.reduce((acc, category) => {
            acc[category.type] = 0;
            return acc;
        }, {})
    );


    const createTransaction = useCallback(() => {
        if (Number.isNaN(Number(formData.amount)) || !formData.date.includes('-')) return;
        const budgetLimit = budgets[formData.category];
        const transactionAmount = Number(formData.amount);

        if (budgetLimit > 0 && transactionAmount > budgetLimit) {
            // Show a notification or visual indicator that the budget limit is exceeded
            setNotificationOpen(true);
            return;
        }

        const transaction = { ...formData, amount: Number(formData.amount), id: uuidv4() };

        setOpen(true);
        addTransaction(transaction);
        setFormData((prevFormData) => ({ ...prevFormData, ...initialState }));
    }, [addTransaction, formData, budgets]);
    useEffect(() => {
        if (segment) {
            if (segment.intent.intent === 'add_expense') {
                setFormData({ ...formData, type: 'Expense' });
            }
            else if (segment.intent.intent === 'add_income') {
                setFormData({ ...formData, type: 'Income' });
            } else if (segment.isFinal && segment.intent.intent === 'create_transaction') {
                return createTransaction();
            } else if (segment.isFinal && segment.intent.intent === 'cancel_transaction') {
                return setFormData(initialState);
            }
            segment.entities.forEach((e) => {
                //  console.log(e.value);
                const category = `${e.value.charAt(0)}${e.value.slice(1).toLowerCase()}`
                switch (e.type) {
                    case 'amount':
                        setFormData({ ...formData, amount: e.value });
                        break;
                    case 'category':
                        if (incomeCategories.map((ic) => ic.type).includes(category)) {
                            setFormData({ ...formData, type: 'Income', category });
                        } else if (expenseCategories.map((ic) => ic.type).includes(category)) {
                            setFormData({ ...formData, type: 'Expense', category });
                        }
                        break;
                    case 'date':
                        setFormData({ ...formData, date: e.value });
                        break;
                    default:
                        break;
                }
            });
            if (segment.isFinal && formData.amount && formData.category && formData.type && formData.date) {
                createTransaction();
            }
        }
    }, [segment, createTransaction, formData])
    const selectedCategories = formData.type === 'Income' ? incomeCategories : expenseCategories;

    return (
        <Grid container spacing={2}>
            <Snackbar open={notificationOpen} autoHideDuration={6000} onClose={handleCloseNotification}>
                <MuiAlert elevation={6} variant="filled" onClose={handleCloseNotification} severity="warning">
                    Budget limit exceeded for {formData.category} category!
                </MuiAlert>
            </Snackbar>
            <CustomizedSnackbar open={open} setOpen={setOpen} />
            <Grid item xs={12}>
                <Typography align="center" variant="subtitle2" gutterBottom>
                    {segment &&
                        <>
                            {segment.words.map((w) => w.value).join(" ")}
                        </>
                    }
                </Typography>
            </Grid>
            <Grid item xs={6}>
                <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select value={formData.type} onChange={(e) => setFormData({
                        ...formData, type: e.target.value
                    })}>
                        <MenuItem value="Income">Income</MenuItem>
                        <MenuItem value="Expense">Expense</MenuItem>
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={6}>
                <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select value={formData.category} onChange={(e) => setFormData({
                        ...formData, category: e.target.value
                    })}>
                        {selectedCategories.map((c) => <MenuItem key={c.type} value={c.type}>{c.type}</MenuItem>)}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={6}>
                <TextField type="number" label="Amount" fullWidth value={formData.amount} onChange={(e) => setFormData({
                    ...formData, amount: e.target.value
                })}></TextField>
            </Grid>
            <Grid item xs={6}>
                <TextField type="date" label="Date" fullWidth value={formData.date} onChange={(e) => setFormData({
                    ...formData, date: formatDate(e.target.value)
                })}  ></TextField>
            </Grid>
            {/* Step 2: Display Budget Input Fields */}
            {formData.type === 'Expense' && (
                <Grid item xs={6}>
                    <TextField
                        type="number"
                        label="Budget"
                        fullWidth
                        value={budgets[formData.category] !== undefined ? budgets[formData.category] : 0}
                        onChange={(e) =>
                            setBudgets({
                                ...budgets,
                                [formData.category]: e.target.value,
                            })
                        }
                    />
                </Grid>
            )}
            <Button className={classes.button} variant="outlined" color="primary" fullWidth onClick={createTransaction}>Create</Button>
        </Grid>
    )
}

export default Form
