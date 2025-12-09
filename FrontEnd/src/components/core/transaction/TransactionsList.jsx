import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Result, Form } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook } from '@fortawesome/free-solid-svg-icons';
import Api from '../../../helpers/core/Api';
import ContentPanel from '../layout/ContentPanel';
import Table from '../table/Table';
import TransactionsBalance from './TransactionsBalance';
import { TransactionForm, transactionFormSubmit } from './TransactionFrom';

const TransactionsList = () => {
  const { t } = useTranslation();
  const [dataTransactions, setDataTransactions] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [editTransaction, setEditTransaction] = useState(false);
  const [transactionRecord, setTransactionRecord] = useState(null);
  const [form] = Form.useForm();

  // Funzione per recuperare tutte le transazioni dal database
  const handleLoadTransactions = async () =>
    Api.get(`/transactions`)
      .then(res => {
        setDataTransactions(res.data);
      })
      .catch(err => err?.globalHandler());

  useEffect(() => {
    handleLoadTransactions();
  }, []);

  // Funzione per salvare i dati di una transazione quando la si vuole modificare
  const handleEdit = record => {
    setTransactionRecord(record);
    setEditTransaction(true);
  };

  // Filtra le transazioni basandosi sulla descrizione
  const handleSearch = e => {
    const searchValue = decodeURIComponent(e.target.value).toLowerCase();
    const filtered = dataTransactions.transactions.filter(tx => tx.description.toLowerCase().includes(searchValue));
    setFilteredData(filtered);
  };

  // Funzione per eliminare una transazione dal database
  const handleDelete = async values => {
    const transactionId = values._id;
    return Api.delete(`/transactions/${transactionId}`)
      .then(async () => {
        await handleLoadTransactions();
      })
      .catch(err => err?.globalHandler());
  };

  // Configurazione per Table
  const initColumns = [
    {
      title: t('transaction.table.value'),
      dataIndex: 'value',
      key: 'value',
      sorter: (a, b) => {
        const valA = a.isExpense ? -a.value : a.value;
        const valB = b.isExpense ? -b.value : b.value;
        return valA - valB;
      },
      render: (value, record) => {
        const sign = record.isExpense ? '-' : '';
        return `${value} € ${sign}`;
      }
    },
    { title: t('transaction.table.description'), dataIndex: 'description', key: 'description' },
    {
      title: t('transaction.table.date'),
      dataIndex: 'date',
      key: 'date',
      render: date => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.date) - new Date(b.date)
    }
  ];

  // Configurazione form per l'aggiunta o modifica di una nuova transazione
  const addFormConfig = {
    title: t(`transaction.formTitle.${editTransaction ? 'editTransaction' : 'newTransaction'}`),
    template: <TransactionForm form={form} record={transactionRecord} editTransaction={editTransaction} />,
    onSave: async () => {
      const method = editTransaction ? 'patch' : 'post';
      const transactionId = await transactionRecord?._id;
      const values = await form.validateFields();

      await transactionFormSubmit(values, method, transactionId);
      await handleLoadTransactions();

      if (editTransaction === false) {
        form.resetFields();
      }
    },
    onCancel: () => {
      if (editTransaction === false) {
        form.resetFields();
      }
      setEditTransaction(false);
    }
  };

  return (
    <ContentPanel title="Fullstack Test">
      {!dataTransactions && (
        <Result
          icon={<FontAwesomeIcon icon={faBook} size="4x" className="text-primary" />}
          title="Expense and Income Diary"
          subTitle="Track daily expenses and incomes."
        />
      )}
      {dataTransactions && (
        <>
          <TransactionsBalance balance={dataTransactions.balance} />
          <Table
            dataSource={!filteredData ? dataTransactions.transactions : filteredData}
            columns={initColumns}
            rowKey="_id"
            addForm={addFormConfig}
            onEdit={record => handleEdit(record)}
            editCancelButtonOnRow
            onDelete={record => handleDelete(record)}
            deleteSaveButtonOnRow
            searchBar
            onChangeSearchBar={handleSearch}
            sortableKeys={['value', 'date']}
            rowClassName={record => (record.isExpense ? 'row-expense' : 'row-income')}
            pagination={false}
          />
        </>
      )}
    </ContentPanel>
  );
};

export default TransactionsList;
