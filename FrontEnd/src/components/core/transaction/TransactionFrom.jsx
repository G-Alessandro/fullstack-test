import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Form } from 'antd';
import dayjs from 'dayjs';
import Api from '../../../helpers/core/Api';
import ProceduralFormItem from '../controls/ProceduralFormItem';

// Funzione per inviare i dati della transazione nuova/modificata al API
const transactionFormSubmit = async (values, method, transactionId) => {
  const { value, description, isExpense } = values;
  const date = new Date(values.date).toISOString();
  const url = method === 'post' ? '/transactions' : `/transactions/${transactionId}`;
  return Api[method](url, { value, description, isExpense, date }).catch(err => err?.globalHandler());
};

// Form di aggiunta/modifica di una transazione usato per il template
const TransactionForm = ({ form, record, editTransaction, disabled, layout = 'vertical' }) => {
  const { i18n, t } = useTranslation();
  const [fields, setFields] = useState();

  // Configurazione inputs del form
  useEffect(() => {
    setFields([
      {
        name: 'value',
        type: 'number',
        title: t('transaction.formFields.amount.title'),
        min: 0.01,
        max: 99999,
        step: 0.01,
        placeholder: '99999Max',
        isRequired: true
      },
      { name: 'isExpense', type: 'boolean', title: t('transaction.formFields.isExpense.title'), isRequired: true },
      {
        name: 'description',
        type: 'comment',
        title: t('transaction.formFields.description.title'),
        placeholder: t('transaction.formFields.description.placeholder'),
        maxLength: 120
      },
      {
        name: 'date',
        type: 'date',
        title: t('transaction.formFields.date.title'),
        isRequired: true,
        default: new Date()
      }
    ]);
  }, [i18n.language]);

  // Imposta tutti i field del form con quelli della transazione da modificare
  useEffect(() => {
    if (record && editTransaction) {
      form.setFieldsValue({
        ...record,
        date: record.date ? dayjs(record.date) : null
      });
    } else {
      form.resetFields();
    }
  }, [record, editTransaction]);

  return (
    <Form form={form} disabled={disabled} layout={layout}>
      <div className="-mx-4 flex flex-wrap">
        {fields &&
          fields
            .filter(i => i.type !== 'checkbox')
            .map(i => <ProceduralFormItem form={form} key={i.name} item={i} disabled={disabled} />)}
      </div>
    </Form>
  );
};

export { TransactionForm, transactionFormSubmit };
