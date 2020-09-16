import React, { useState } from 'react';

// Apollo imports
import { useMutation, useQuery } from 'react-apollo';
import gql from 'graphql-tag';

// ant.design imports
import { DeleteOutlined } from '@ant-design/icons';
import { Typography, Table, Button, Modal, Input, Form, Row } from 'antd';

// App component imports
import { RecordSubmit } from './../DataRecordSubmit';
import EditForm from './EditForm';

// Apollo Client queries and mutation
const RECORD_QUERY = gql`
  {
    records {
      id
      name
      type {
        id
        name
      }
      fields {
        id
        name
        value
      }
      coordinates {
        latitude
        longitude
      }
    }
  }
`;

const UPDATE_RECORD_MUTATION = gql`
  mutation {
    updateRecord(
      input: {
        id: "f4061943-146d-4a86-baaa-0a1a4987ce79-1598985743997"
        name: "Rando Local 03"
        # typeId: "7489e4dd-e44f-4ae6-8552-8de2a1eec7b1-1598887137215"
        coordinates: { latitude: -28.050505, longitude: 140.095051 }
        fields: [
          { name: "Update Field1", value: "1Field" }
          { name: "Update Field2", value: "2Field" }
          { name: "Update Field3", value: "3Field" }
        ]
      }
    ) {
      record {
        id
        name
        type {
          id
          name
        }
        fields {
          id
          name
          value
        }
        coordinates {
          latitude
          longitude
        }
      }
    }
  }
`;

const DELETE_RECORD_MUTATION = gql`
  mutation deleteRecord($id: ID!) {
    deleteRecord(input: { id: $id }) {
      success
      error
    }
  }
`;

const RecordsTable = () => {
  const { Title } = Typography;
  const [form] = Form.useForm();

  let recordsToRender = [];

  const [modalState, setModalState] = useState({
    ModalText: 'Content of Modal',
    visible: false,
    confirmLoading: false,
    data: {},
  });

  const [deleteRecord] = useMutation(DELETE_RECORD_MUTATION);
  const [updateRecordMutation] = useMutation(UPDATE_RECORD_MUTATION);
  const { loading, error, data, refetch } = useQuery(RECORD_QUERY, {
    pollInterval: 20000,
  });

  if (loading) {
    return <div>Fetching</div>;
  }
  if (error !== undefined) {
    console.log(error);
    if (error.networkError !== undefined) {
      // Check if error response is JSON
      try {
        JSON.parse(error.networkError.bodyText);
      } catch (e) {
        // If not replace parsing error message with real one
        error.networkError.message = error.networkError.bodyText;
      }
      return <div>{error.networkError.message}</div>;
    }
  }
  if (data.records !== undefined) {
    recordsToRender = data.records;
  }
  const submitUpdateRecord = props => {
    // updateRecordMutation({
    //   variables: {
    //     id: props.key.toString(),
    //     name: props.newType.name.toString(),
    //   },
    // });
    console.log(props);
    console.log('modalState', modalState);
  };

  const save = async key => {
    try {
      const newRecord = await form.validateFields();
      // submitUpdateRecord({ key, newType });
      console.log('save fcn', newRecord);
      // setEditingKey('');
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  ////////////////////////////////////
  const showModal = props => {
    setModalState({
      ...modalState,
      visible: true,
      data: props,
    });
    // console.log("showModal props", props);
  };

  const handleOk = props => {
    setModalState({
      ...modalState,
      ModalText: 'The modal will be closed after two seconds',
      confirmLoading: true,
    });
    submitUpdateRecord(props);
    setTimeout(() => {
      setModalState({
        ...modalState,
        visible: false,
        confirmLoading: false,
      });
    }, 2000);
  };

  const handleCancel = () => {
    console.log('Clicked cancel button');
    setModalState({
      visible: false,
    });
  };

  // Define nested tables to display field data
  const expandedRowRender = props => {
    const columns = [
      { title: 'Field Id', dataIndex: 'id', key: 'date' },
      { title: 'Field Name', dataIndex: 'name', key: 'name' },
      { title: 'Field Value', dataIndex: 'value', key: 'value' },
    ];

    return (
      <Table columns={columns} dataSource={props.fields} pagination={false} />
    );
  };
  // Column definitions for ant design table
  const columns = [
    {
      title: 'Record Name',
      dataIndex: 'name',
      key: 'name',
      editable: true,
      defaultSortOrder: 'ascend',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Record Type',
      dataIndex: 'type',
      key: 'type',

      render: record => record.name,
      editable: true,
      sorter: (a, b) => a.type.name.localeCompare(b.type.name),
    },
    {
      title: 'Location',
      children: [
        {
          title: 'Latitude',
          dataIndex: 'coordinates',
          render: record => record.latitude,
          editable: true,
        },
        {
          title: 'Longitude',
          dataIndex: 'coordinates',
          render: record => record.longitude,
          editable: true,
        },
      ],
    },
    {
      // title: 'Operation',
      dataIndex: 'operation',
      render: (_, record) => {
        return (
          <Row justify="center">
            <Button onClick={() => showModal(record)}>Edit</Button>
            <Modal
              title="Edit Record"
              // okText="Save"
              footer={null}
              visible={modalState.visible}
              // onOk={handleOk}
              confirmLoading={modalState.confirmLoading}
              // onCancel={handleCancel}
            >
              <EditForm
                modalData={modalState.data}
                setModalState={setModalState}
                handleCancel={handleCancel}
                handleOk={handleOk}
              />
            </Modal>
          </Row>
        );
      },
    },
    {
      dataIndex: 'delete',
      editable: false,
      key: 'id',
      render: (_, record) => (
        <Row justify="center">
          <Button
            danger
            onClick={e => {
              return (
                deleteRecord({
                  variables: {
                    id: record.id,
                  },
                }),
                refetch()
              );
            }}
            icon={<DeleteOutlined />}
          />
        </Row>
      ),
    },
  ];

  function tableFcns(pagination, filters, sorter, extra) {
    console.log('params', pagination, filters, sorter, extra);
  }
  return (
    <>
      <div>
        <h2>Submit new data record:</h2>
        <RecordSubmit refetch={refetch} />
      </div>
      <div>
        <Title level={2}>Database</Title>
        <Table
          bordered
          dataSource={recordsToRender}
          columns={columns}
          rowKey="id"
          expandable={{ expandedRowRender }}
          rowClassName="editable-row"
          onChange={tableFcns}
        />
      </div>
    </>
  );
};

export default RecordsTable;
