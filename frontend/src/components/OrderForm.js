import React, { useState } from 'react';
import axios from 'axios';

const OrderForm = () => {
    const [userId, setUserId] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [field, setField] = useState('');
    const [orderId, setOrderId] = useState('');
    const [price, setPrice] = useState('');
    const [invoice, setInvoice] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/api/order',{
                userId, customerId, field, orderId, price
            });
            setInvoice(response.data.invoice);
            alert('Order placed successfully!');
        } catch (error) {
           setError('Error placing order:' + error.message);
        }
    };
    return (
        <div>
            <h1>Place Order</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} required />
                <input type="text" placeholder="Customer ID" value={customerId} onChange={(e) => setCustomerId(e.target.value)} required />
                <input type="text" placeholder="Field" value={field} onChange={(e) => setField(e.target.value)} required />
                <input type="text" placeholder="Order ID" value={orderId} onChange={(e) => setOrderId(e.target.value)} required />
                <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required />
                <button type="submit">Place Order</button>
            </form>
            {invoice && ( 
                <p>Invoice generated:{" "} 
                 <a 
                        href={`http://localhost:5000/invoices/${invoice}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        View Invoice
                        
                    </a>
                </p>
            )}

            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default OrderForm;