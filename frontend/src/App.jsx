
import { useEffect, useState } from "react";
import "./App.css";

const API_BASE = "http://127.0.0.1:8000/api";

const initialCustomerForm = {
  customer_id: "",
  full_name: "",
  phone: "",
  email: "",
  address: "",
  branch_name: "",
  is_active: true,
};

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  const [dashboard, setDashboard] = useState({
    total_collected: "0.00",
    pending_reconciliation: 0,
    total_deposited: "0.00",
    total_settled: "0.00",
  });

  const [customers, setCustomers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [collections, setCollections] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [deposits, setDeposits] = useState([]);

  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [savingCollection, setSavingCollection] = useState(false);
  const [savingSubmission, setSavingSubmission] = useState(false);
  const [savingDeposit, setSavingDeposit] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [showDepositForm, setShowDepositForm] = useState(false);

  const [customerForm, setCustomerForm] = useState(initialCustomerForm);

  const [collectionForm, setCollectionForm] = useState({
    schedule: "",
    amount: "",
    remarks: "",
  });

  const [submissionForm, setSubmissionForm] = useState({
    branch_name: "Pune",
    remarks: "",
  });

  const [reconcileAmounts, setReconcileAmounts] = useState({});

  const [depositForm, setDepositForm] = useState({
    submission: "",
    bank_name: "",
    amount: "",
    deposit_date: new Date().toISOString().slice(0, 10),
    bank_reference: "",
    remarks: "",
  });

  const [settlementAmounts, setSettlementAmounts] = useState({});

  const menuItems = [
    "Dashboard",
    "Customers",
    "Loans",
    "Collections",
    "Reconciliation",
    "Bank Deposits",
  ];

  function getToken() {
    return localStorage.getItem("access_token");
  }

  async function apiGet(endpoint) {
    const token = getToken();

    if (!token) {
      throw new Error("Please log in using a valid access token.");
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  async function fetchDashboard() {
    try {
      setLoading(true);
      setApiError("");
      setDashboard(await apiGet("/dashboard/summary/"));
    } catch (error) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCustomers() {
    try {
      setLoading(true);
      setApiError("");
      const data = await apiGet("/customers/");
      setCustomers(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLoans() {
    try {
      setLoading(true);
      setApiError("");
      const data = await apiGet("/loans/");
      setLoans(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCollections() {
    try {
      setLoading(true);
      setApiError("");
      const data = await apiGet("/collections/");
      setCollections(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSchedules() {
    try {
      const data = await apiGet("/repayment-schedules/");
      setSchedules(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      // Schedule endpoint may need to be registered in Django first.
      setSchedules([]);
      setApiError(
        `${error.message}. Check that the repayment-schedules API is configured.`
      );
    }
  }

  async function fetchSubmissions() {
    try {
      setLoading(true);
      setApiError("");
      const data = await apiGet("/submissions/");
      const rows = Array.isArray(data) ? data : data.results || [];
      setSubmissions(rows);
      setReconcileAmounts((previous) => {
        const next = { ...previous };
        rows.forEach((row) => {
          if (next[row.id] === undefined) next[row.id] = "";
        });
        return next;
      });
    } catch (error) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchDeposits() {
    try {
      setLoading(true);
      setApiError("");
      const data = await apiGet("/deposits/");
      const rows = Array.isArray(data) ? data : data.results || [];
      setDeposits(rows);
      setSettlementAmounts((previous) => {
        const next = { ...previous };
        rows.forEach((row) => {
          if (next[row.id] === undefined) {
            next[row.id] = row.amount || "";
          }
        });
        return next;
      });
    } catch (error) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function sendApiRequest(endpoint, method, body) {
    const token = getToken();
    if (!token) throw new Error("Please log in using a valid access token.");

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const details = typeof data === "object"
        ? Object.entries(data).map(([field, errors]) => {
            const message = Array.isArray(errors) ? errors.join(", ") : String(errors);
            return field === "detail" ? message : `${field}: ${message}`;
          }).join(" | ")
        : String(data);
      throw new Error(details || `API Error: ${response.status}`);
    }
    return data;
  }

  async function handleSubmissionSubmit(event) {
    event.preventDefault();
    try {
      setSavingSubmission(true);
      setApiError("");
      setSuccessMessage("");
      const data = await sendApiRequest("/submissions/", "POST", submissionForm);
      setSuccessMessage(`Cash submission created: ${data.submission_number}`);
      setShowSubmissionForm(false);
      setSubmissionForm({ branch_name: "Pune", remarks: "" });
      await fetchSubmissions();
      await fetchDashboard();
    } catch (error) {
      setApiError(error.message);
    } finally {
      setSavingSubmission(false);
    }
  }

  async function handleReconcile(submissionId) {
    const actualAmount = reconcileAmounts[submissionId];
    if (actualAmount === undefined || actualAmount === "") {
      setApiError("Enter the actual cash amount before reconciling.");
      return;
    }
    try {
      setProcessingId(submissionId);
      setApiError("");
      setSuccessMessage("");
      const data = await sendApiRequest(
        `/submissions/${submissionId}/reconcile/`,
        "POST",
        { actual_amount: actualAmount }
      );
      setSuccessMessage(`Submission ${data.submission_number} processed: ${data.status}`);
      await fetchSubmissions();
      await fetchDashboard();
    } catch (error) {
      setApiError(error.message);
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDepositSubmit(event) {
    event.preventDefault();
    try {
      setSavingDeposit(true);
      setApiError("");
      setSuccessMessage("");
      const payload = {
        ...depositForm,
        submission: Number(depositForm.submission),
      };
      const data = await sendApiRequest("/deposits/", "POST", payload);
      setSuccessMessage(`Bank deposit created: ${data.deposit_reference}`);
      setShowDepositForm(false);
      setDepositForm({
        submission: "",
        bank_name: "",
        amount: "",
        deposit_date: new Date().toISOString().slice(0, 10),
        bank_reference: "",
        remarks: "",
      });
      await fetchDeposits();
      await fetchDashboard();
    } catch (error) {
      setApiError(error.message);
    } finally {
      setSavingDeposit(false);
    }
  }

  async function handleSettle(depositId) {
    const settledAmount = settlementAmounts[depositId];
    if (settledAmount === undefined || settledAmount === "") {
      setApiError("Enter the settled amount first.");
      return;
    }
    try {
      setProcessingId(depositId);
      setApiError("");
      setSuccessMessage("");
      const data = await sendApiRequest(
        `/deposits/${depositId}/settle/`,
        "POST",
        { settled_amount: settledAmount }
      );
      setSuccessMessage(`Deposit ${data.deposit_reference}: ${data.status}`);
      await fetchDeposits();
      await fetchDashboard();
    } catch (error) {
      setApiError(error.message);
    } finally {
      setProcessingId(null);
    }
  }

  useEffect(() => {
    setApiError("");
    setSuccessMessage("");

    if (activePage === "Dashboard") {
      fetchDashboard();
    } else if (activePage === "Customers") {
      fetchCustomers();
    } else if (activePage === "Loans") {
      fetchLoans();
    } else if (activePage === "Collections") {
      fetchCollections();
      fetchSchedules();
    } else if (activePage === "Reconciliation") {
      fetchSubmissions();
    } else if (activePage === "Bank Deposits") {
      fetchDeposits();
      fetchSubmissions();
    }
  }, [activePage]);

  function handleCustomerChange(event) {
    const { name, value, type, checked } = event.target;

    setCustomerForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleCustomerSubmit(event) {
    event.preventDefault();

    try {
      setSavingCustomer(true);
      setApiError("");
      setSuccessMessage("");

      const token = getToken();

      if (!token) {
        throw new Error("Please log in before adding a customer.");
      }

      const response = await fetch(`${API_BASE}/customers/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerForm),
      });

      const data = await response.json();

      if (!response.ok) {
        const details = Object.entries(data)
          .map(([field, errors]) =>
            `${field}: ${Array.isArray(errors) ? errors.join(", ") : errors}`
          )
          .join(" | ");

        throw new Error(details || "Unable to add customer.");
      }

      setCustomers((previous) => [...previous, data]);
      setSuccessMessage("Customer added successfully.");
      setShowCustomerForm(false);
      setCustomerForm(initialCustomerForm);
    } catch (error) {
      setApiError(error.message);
    } finally {
      setSavingCustomer(false);
    }
  }

  async function handleCollectionSubmit(event) {
    event.preventDefault();

    try {
      setSavingCollection(true);
      setApiError("");
      setSuccessMessage("");

      const token = getToken();

      if (!token) {
        throw new Error("Please log in before recording a collection.");
      }

      const response = await fetch(`${API_BASE}/collections/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          schedule: Number(collectionForm.schedule),
          amount: collectionForm.amount,
          remarks: collectionForm.remarks,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const details = Object.entries(data)
          .map(([field, errors]) =>
            `${field}: ${Array.isArray(errors) ? errors.join(", ") : errors}`
          )
          .join(" | ");

        throw new Error(details || "Unable to record collection.");
      }

      setSuccessMessage(
        `Collection recorded successfully. Receipt: ${data.receipt_number}`
      );
      setShowCollectionForm(false);
      setCollectionForm({ schedule: "", amount: "", remarks: "" });

      await fetchCollections();
      await fetchDashboard();
    } catch (error) {
      setApiError(error.message);
    } finally {
      setSavingCollection(false);
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>CMRS</h2>
        <p className="subtitle">Cash Management System</p>

        <nav>
          {menuItems.map((item) => (
            <button
              key={item}
              className={
                activePage === item ? "menu-item active" : "menu-item"
              }
              onClick={() => setActivePage(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>{activePage}</h1>
            <p>Cash Management &amp; Reconciliation System</p>
          </div>
          <span className="user-badge">Administrator</span>
        </header>

        {loading && <p>Loading data...</p>}
        {apiError && <p role="alert">{apiError}</p>}
        {successMessage && <p role="status">{successMessage}</p>}

        {activePage === "Dashboard" && (
          <>
            <section className="welcome">
              <h2>Welcome to CMRS</h2>
              <p>
                Monitor collections, reconciliation and bank settlements.
              </p>
            </section>

            <section className="stats-grid">
              <article className="stat-card">
                <p>Total Collected</p>
                <h2>₹{dashboard.total_collected}</h2>
                <span>Customer repayments</span>
              </article>
              <article className="stat-card">
                <p>Pending Reconciliation</p>
                <h2>{dashboard.pending_reconciliation}</h2>
                <span>Awaiting branch review</span>
              </article>
              <article className="stat-card">
                <p>Total Deposited</p>
                <h2>₹{dashboard.total_deposited}</h2>
                <span>Bank deposits</span>
              </article>
              <article className="stat-card">
                <p>Total Settled</p>
                <h2>₹{dashboard.total_settled}</h2>
                <span>Bank settlements</span>
              </article>
            </section>

            <section className="activity-card">
              <h3>System Overview</h3>
              <p>
                Manage customers, loans, repayments, branch cash submissions
                and bank settlements from one place.
              </p>
            </section>
          </>
        )}

        {activePage === "Customers" && (
          <section className="activity-card">
            <div className="module-heading">
              <h2>Customer Records</h2>
              <button
                type="button"
                onClick={() => {
                  setApiError("");
                  setSuccessMessage("");
                  setShowCustomerForm((previous) => !previous);
                }}
              >
                {showCustomerForm ? "Cancel" : "+ Add Customer"}
              </button>
            </div>

            {showCustomerForm && (
              <form onSubmit={handleCustomerSubmit} className="data-form">
                <label>
                  Customer ID *
                  <input
                    name="customer_id"
                    value={customerForm.customer_id}
                    onChange={handleCustomerChange}
                    maxLength={20}
                    required
                  />
                </label>
                <label>
                  Full Name *
                  <input
                    name="full_name"
                    value={customerForm.full_name}
                    onChange={handleCustomerChange}
                    maxLength={150}
                    required
                  />
                </label>
                <label>
                  Phone *
                  <input
                    name="phone"
                    type="tel"
                    value={customerForm.phone}
                    onChange={handleCustomerChange}
                    maxLength={15}
                    required
                  />
                </label>
                <label>
                  Email
                  <input
                    name="email"
                    type="email"
                    value={customerForm.email}
                    onChange={handleCustomerChange}
                  />
                </label>
                <label>
                  Branch Name *
                  <input
                    name="branch_name"
                    value={customerForm.branch_name}
                    onChange={handleCustomerChange}
                    maxLength={100}
                    required
                  />
                </label>
                <label>
                  Address
                  <input
                    name="address"
                    value={customerForm.address}
                    onChange={handleCustomerChange}
                  />
                </label>
                <label className="checkbox-label">
                  <input
                    name="is_active"
                    type="checkbox"
                    checked={customerForm.is_active}
                    onChange={handleCustomerChange}
                  />
                  Active Customer
                </label>
                <div className="form-actions">
                  <button type="submit" disabled={savingCustomer}>
                    {savingCustomer ? "Saving..." : "Save Customer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomerForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Customer ID</th>
                    <th>Full Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Branch</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.customer_id}</td>
                      <td>{customer.full_name}</td>
                      <td>{customer.phone}</td>
                      <td>{customer.email || "-"}</td>
                      <td>{customer.branch_name}</td>
                      <td>{customer.is_active ? "Active" : "Inactive"}</td>
                    </tr>
                  ))}
                  {customers.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6}>No customers found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activePage === "Loans" && (
          <section className="activity-card">
            <h2>Loan Records</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Loan ID</th>
                    <th>Customer</th>
                    <th>Principal Amount</th>
                    <th>Interest Rate</th>
                    <th>Tenure</th>
                    <th>Start Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan) => (
                    <tr key={loan.id}>
                      <td>{loan.loan_id}</td>
                      <td>{loan.customer_name || `Customer #${loan.customer}`}</td>
                      <td>₹{loan.principal_amount}</td>
                      <td>{loan.interest_rate}%</td>
                      <td>{loan.tenure_months} months</td>
                      <td>{loan.start_date}</td>
                      <td>{loan.is_active ? "Active" : "Inactive"}</td>
                    </tr>
                  ))}
                  {loans.length === 0 && !loading && (
                    <tr>
                      <td colSpan={7}>No loans found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activePage === "Collections" && (
          <section className="activity-card">
            <div className="module-heading">
              <h2>Collection Records</h2>
              <button
                type="button"
                onClick={() => {
                  setApiError("");
                  setSuccessMessage("");
                  setShowCollectionForm((previous) => !previous);
                }}
              >
                {showCollectionForm ? "Cancel" : "+ Record Repayment"}
              </button>
            </div>

            {showCollectionForm && (
              <form onSubmit={handleCollectionSubmit} className="data-form">
                <label>
                  Repayment Schedule *
                  <select
                    name="schedule"
                    value={collectionForm.schedule}
                    onChange={(event) =>
                      setCollectionForm((previous) => ({
                        ...previous,
                        schedule: event.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Select schedule</option>
                    {schedules.map((schedule) => (
                      <option key={schedule.id} value={schedule.id}>
                        Schedule #{schedule.id} — Loan #{schedule.loan} — Due{" "}
                        {schedule.due_date} — Balance ₹
                        {(
                          Number(schedule.installment_amount) -
                          Number(schedule.paid_amount)
                        ).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Amount *
                  <input
                    name="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={collectionForm.amount}
                    onChange={(event) =>
                      setCollectionForm((previous) => ({
                        ...previous,
                        amount: event.target.value,
                      }))
                    }
                    required
                  />
                </label>

                <label>
                  Remarks
                  <input
                    name="remarks"
                    value={collectionForm.remarks}
                    onChange={(event) =>
                      setCollectionForm((previous) => ({
                        ...previous,
                        remarks: event.target.value,
                      }))
                    }
                    placeholder="Optional remarks"
                  />
                </label>

                {schedules.length === 0 && (
                  <p>
                    No repayment schedules are available. Check the Django
                    repayment-schedules API before recording a collection.
                  </p>
                )}

                <div className="form-actions">
                  <button
                    type="submit"
                    disabled={savingCollection || schedules.length === 0}
                  >
                    {savingCollection ? "Saving..." : "Save Collection"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCollectionForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Receipt Number</th>
                    <th>Schedule ID</th>
                    <th>Amount</th>
                    <th>Collected At</th>
                    <th>Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {collections.map((collection) => (
                    <tr key={collection.id}>
                      <td>{collection.receipt_number}</td>
                      <td>{collection.schedule}</td>
                      <td>₹{collection.amount}</td>
                      <td>
                        {new Date(collection.collected_at).toLocaleString()}
                      </td>
                      <td>{collection.status}</td>
                      <td>{collection.remarks || "-"}</td>
                    </tr>
                  ))}
                  {collections.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6}>No collection records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activePage === "Reconciliation" && (
          <section className="activity-card">
            <div className="module-heading">
              <h2>Cash Submissions</h2>
              <button type="button" onClick={() => {
                setApiError("");
                setSuccessMessage("");
                setShowSubmissionForm((previous) => !previous);
              }}>
                {showSubmissionForm ? "Cancel" : "+ Submit Cash"}
              </button>
            </div>

            {showSubmissionForm && (
              <form onSubmit={handleSubmissionSubmit} className="data-form">
                <label>
                  Branch Name *
                  <input
                    value={submissionForm.branch_name}
                    onChange={(event) => setSubmissionForm((previous) => ({ ...previous, branch_name: event.target.value }))}
                    maxLength={100}
                    required
                  />
                </label>
                <label>
                  Remarks
                  <input
                    value={submissionForm.remarks}
                    onChange={(event) => setSubmissionForm((previous) => ({ ...previous, remarks: event.target.value }))}
                    placeholder="Optional remarks"
                  />
                </label>
                <div className="form-actions">
                  <button type="submit" disabled={savingSubmission}>
                    {savingSubmission ? "Submitting..." : "Submit Cash"}
                  </button>
                  <button type="button" onClick={() => setShowSubmissionForm(false)}>Cancel</button>
                </div>
                <p>Expected amount is calculated by the backend from this agent's collected cash.</p>
              </form>
            )}

            <div className="table-container">
              <table>
                <thead><tr>
                  <th>Submission</th><th>Branch</th><th>Expected</th><th>Actual</th><th>Discrepancy</th><th>Status</th><th>Submitted At</th><th>Reconcile</th>
                </tr></thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission.id}>
                      <td>{submission.submission_number}</td>
                      <td>{submission.branch_name}</td>
                      <td>₹{submission.expected_amount}</td>
                      <td>{submission.actual_amount == null ? "-" : `₹${submission.actual_amount}`}</td>
                      <td>{submission.discrepancy == null ? "-" : `₹${submission.discrepancy}`}</td>
                      <td>{submission.status}</td>
                      <td>{submission.submitted_at ? new Date(submission.submitted_at).toLocaleString() : "-"}</td>
                      <td>
                        {submission.status === "PENDING" ? (
                          <div className="inline-action">
                            <input
                              type="number" min="0" step="0.01" aria-label={`Actual amount for ${submission.submission_number}`}
                              value={reconcileAmounts[submission.id] ?? ""}
                              onChange={(event) => setReconcileAmounts((previous) => ({ ...previous, [submission.id]: event.target.value }))}
                              placeholder="Actual ₹"
                            />
                            <button type="button" disabled={processingId === submission.id} onClick={() => handleReconcile(submission.id)}>
                              {processingId === submission.id ? "Saving..." : "Reconcile"}
                            </button>
                          </div>
                        ) : "Completed"}
                      </td>
                    </tr>
                  ))}
                  {submissions.length === 0 && !loading && <tr><td colSpan={8}>No cash submissions found.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activePage === "Bank Deposits" && (
          <section className="activity-card">
            <div className="module-heading">
              <h2>Bank Deposits</h2>
              <button type="button" onClick={() => {
                setApiError("");
                setSuccessMessage("");
                setShowDepositForm((previous) => !previous);
              }}>
                {showDepositForm ? "Cancel" : "+ Add Deposit"}
              </button>
            </div>

            {showDepositForm && (
              <form onSubmit={handleDepositSubmit} className="data-form">
                <label>
                  Approved Submission *
                  <select value={depositForm.submission} onChange={(event) => setDepositForm((previous) => ({ ...previous, submission: event.target.value }))} required>
                    <option value="">Select approved submission</option>
                    {submissions.filter((submission) => submission.status === "APPROVED").map((submission) => (
                      <option key={submission.id} value={submission.id}>{submission.submission_number} — {submission.branch_name} — ₹{submission.expected_amount}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Bank Name *
                  <input value={depositForm.bank_name} onChange={(event) => setDepositForm((previous) => ({ ...previous, bank_name: event.target.value }))} maxLength={100} required />
                </label>
                <label>
                  Deposit Amount *
                  <input type="number" min="0.01" step="0.01" value={depositForm.amount} onChange={(event) => setDepositForm((previous) => ({ ...previous, amount: event.target.value }))} required />
                </label>
                <label>
                  Deposit Date *
                  <input type="date" value={depositForm.deposit_date} onChange={(event) => setDepositForm((previous) => ({ ...previous, deposit_date: event.target.value }))} required />
                </label>
                <label>
                  Bank Reference *
                  <input value={depositForm.bank_reference} onChange={(event) => setDepositForm((previous) => ({ ...previous, bank_reference: event.target.value }))} maxLength={100} required />
                </label>
                <label>
                  Remarks
                  <input value={depositForm.remarks} onChange={(event) => setDepositForm((previous) => ({ ...previous, remarks: event.target.value }))} placeholder="Optional remarks" />
                </label>
                {submissions.filter((submission) => submission.status === "APPROVED").length === 0 && <p>No approved submissions available. Approve a submission before creating a deposit.</p>}
                <div className="form-actions">
                  <button type="submit" disabled={savingDeposit || !submissions.some((submission) => submission.status === "APPROVED")}>
                    {savingDeposit ? "Saving..." : "Create Deposit"}
                  </button>
                  <button type="button" onClick={() => setShowDepositForm(false)}>Cancel</button>
                </div>
              </form>
            )}

            <div className="table-container">
              <table>
                <thead><tr>
                  <th>Deposit Reference</th><th>Submission</th><th>Bank</th><th>Amount</th><th>Deposit Date</th><th>Bank Reference</th><th>Settled Amount</th><th>Status</th><th>Settlement</th>
                </tr></thead>
                <tbody>
                  {deposits.map((deposit) => (
                    <tr key={deposit.id}>
                      <td>{deposit.deposit_reference}</td>
                      <td>#{deposit.submission}</td>
                      <td>{deposit.bank_name}</td>
                      <td>₹{deposit.amount}</td>
                      <td>{deposit.deposit_date}</td>
                      <td>{deposit.bank_reference}</td>
                      <td>{deposit.settled_amount == null ? "-" : `₹${deposit.settled_amount}`}</td>
                      <td>{deposit.status}</td>
                      <td>
                        {deposit.status === "PENDING" ? (
                          <div className="inline-action">
                            <input type="number" min="0" step="0.01" aria-label={`Settled amount for ${deposit.deposit_reference}`} value={settlementAmounts[deposit.id] ?? deposit.amount} onChange={(event) => setSettlementAmounts((previous) => ({ ...previous, [deposit.id]: event.target.value }))} />
                            <button type="button" disabled={processingId === deposit.id} onClick={() => handleSettle(deposit.id)}>
                              {processingId === deposit.id ? "Saving..." : "Settle"}
                            </button>
                          </div>
                        ) : "Completed"}
                      </td>
                    </tr>
                  ))}
                  {deposits.length === 0 && !loading && <tr><td colSpan={9}>No bank deposits found.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
