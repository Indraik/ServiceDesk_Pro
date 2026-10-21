import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    Headphones,
    Shield,
    Clock,
    CheckCircle2,
    ArrowRight,
    Users,
    Zap,
    Sparkles,
    Activity,
    Layers,
    Lock,
    Compass
} from "lucide-react";

export default function Home() {
    const { isAuthenticated, user } = useAuth();
    const [activeTab, setActiveTab] = useState("customer");

    const role = user?.role;
    const dashboardLink =
        role === "ADMIN"
            ? "/admin/dashboard"
            : role === "AGENT"
            ? "/agent/dashboard"
            : "/customer/dashboard";

    return (
        <div className="landing-page">
            {/* Background Glow Orbs */}
            <div className="landing-glow landing-glow-1" />
            <div className="landing-glow landing-glow-2" />

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-badge">
                    <Sparkles size={14} className="hero-badge-icon" />
                    <span>Next-Gen Enterprise IT Service Desk</span>
                </div>

                <h1 className="hero-title">
                    Intelligent Support & Ticket Lifecycle, <br />
                    <span className="hero-gradient-text">Engineered for Velocity.</span>
                </h1>

                <p className="hero-subtitle">
                    Transform chaotic IT requests into structured, automated workflows.
                    Complete with multi-role permissions, auditable state transitions,
                    and real-time activity tracking.
                </p>

                <div className="hero-cta-group">
                    {isAuthenticated ? (
                        <Link to={dashboardLink} className="btn btn-primary btn-lg">
                            <span>Go to Your Workspace ({role})</span>
                            <ArrowRight size={18} />
                        </Link>
                    ) : (
                        <>
                            <Link to="/register" className="btn btn-primary btn-lg">
                                <span>Get Started Free</span>
                                <ArrowRight size={18} />
                            </Link>
                            <Link to="/login" className="btn btn-secondary btn-lg">
                                <span>Sign In to Portal</span>
                            </Link>
                        </>
                    )}
                </div>

                {/* Hero Tech Badges */}
                <div className="hero-badges-row">
                    <span className="tech-pill">Spring Boot 4</span>
                    <span className="tech-pill">PostgreSQL</span>
                    <span className="tech-pill">React 19</span>
                    <span className="tech-pill">JWT Stateless Auth</span>
                    <span className="tech-pill">RBAC Architecture</span>
                </div>
            </section>

            {/* Interactive Role Switcher Section */}
            <section className="role-preview-section">
                <div className="section-header text-center">
                    <span className="section-eyebrow">TAILORED EXPERIENCES</span>
                    <h2 className="section-title">Designed for Every IT Stakeholder</h2>
                    <p className="section-description">
                        Switch between specialized portals built for customers, agents, and administrators.
                    </p>
                </div>

                <div className="role-tabs">
                    <button
                        type="button"
                        className={`role-tab-btn ${activeTab === "customer" ? "active" : ""}`}
                        onClick={() => setActiveTab("customer")}
                    >
                        <Users size={16} />
                        <span>Customer Portal</span>
                    </button>
                    <button
                        type="button"
                        className={`role-tab-btn ${activeTab === "agent" ? "active" : ""}`}
                        onClick={() => setActiveTab("agent")}
                    >
                        <Zap size={16} />
                        <span>Agent Workspace</span>
                    </button>
                    <button
                        type="button"
                        className={`role-tab-btn ${activeTab === "admin" ? "active" : ""}`}
                        onClick={() => setActiveTab("admin")}
                    >
                        <Shield size={16} />
                        <span>Admin Console</span>
                    </button>
                </div>

                <div className="role-preview-card">
                    {activeTab === "customer" && (
                        <div className="role-card-content">
                            <div className="role-card-text">
                                <div className="role-tag role-tag-customer">END USERS</div>
                                <h3>Effortless Ticket Submission & Sign-off</h3>
                                <p>
                                    Submit issues with priority and category classifications in seconds.
                                    Follow real-time status progression from Open to Resolved, and hold the
                                    final approval to formally close your request.
                                </p>
                                <ul className="role-feature-list">
                                    <li><CheckCircle2 size={16} className="feature-check" /> 1-Click Ticket Creation with auto-priority</li>
                                    <li><CheckCircle2 size={16} className="feature-check" /> Direct communication comments thread</li>
                                    <li><CheckCircle2 size={16} className="feature-check" /> Customer-only Close verification workflow</li>
                                </ul>
                                <Link to="/customer/dashboard" className="btn btn-outline btn-sm">
                                    Open Customer View
                                </Link>
                            </div>
                            <div className="role-card-mockup">
                                <div className="mockup-header">
                                    <span className="mockup-dot red"></span>
                                    <span className="mockup-dot yellow"></span>
                                    <span className="mockup-dot green"></span>
                                    <span className="mockup-title">Customer Dashboard Preview</span>
                                </div>
                                <div className="mockup-body">
                                    <div className="mockup-stat-row">
                                        <div className="mockup-stat-box">
                                            <span className="mockup-num">4</span>
                                            <span className="mockup-lbl">Open Tickets</span>
                                        </div>
                                        <div className="mockup-stat-box highlight">
                                            <span className="mockup-num">2</span>
                                            <span className="mockup-lbl">Ready to Close</span>
                                        </div>
                                    </div>
                                    <div className="mockup-ticket-item">
                                        <div className="mockup-ticket-title">VPN Access Timeout on Gateway 04</div>
                                        <span className="badge-status-resolved-mock">RESOLVED</span>
                                    </div>
                                    <div className="mockup-ticket-item">
                                        <div className="mockup-ticket-title">Database driver incompatible with v21</div>
                                        <span className="badge-status-in-progress-mock">IN PROGRESS</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "agent" && (
                        <div className="role-card-content">
                            <div className="role-card-text">
                                <div className="role-tag role-tag-agent">SUPPORT AGENTS</div>
                                <h3>High-Efficiency Queue & Fast Resolution</h3>
                                <p>
                                    Focused ticket queues without distractions. Assigned support engineers
                                    transition tickets into progress, post troubleshooting updates, and mark
                                    tickets resolved when solutions are verified.
                                </p>
                                <ul className="role-feature-list">
                                    <li><CheckCircle2 size={16} className="feature-check" /> Focused Assigned Tickets Worklist</li>
                                    <li><CheckCircle2 size={16} className="feature-check" /> Protected status progression actions</li>
                                    <li><CheckCircle2 size={16} className="feature-check" /> Real-time activity timeline tracking</li>
                                </ul>
                                <Link to="/agent/dashboard" className="btn btn-outline btn-sm">
                                    Open Agent View
                                </Link>
                            </div>
                            <div className="role-card-mockup">
                                <div className="mockup-header">
                                    <span className="mockup-dot red"></span>
                                    <span className="mockup-dot yellow"></span>
                                    <span className="mockup-dot green"></span>
                                    <span className="mockup-title">Agent Workspace Preview</span>
                                </div>
                                <div className="mockup-body">
                                    <div className="mockup-ticket-card">
                                        <div className="mockup-card-head">
                                            <span className="mockup-badge-crit">CRITICAL</span>
                                            <span className="mockup-id">#TICK-802</span>
                                        </div>
                                        <p className="mockup-desc">Production payment gateway failing intermittently</p>
                                        <div className="mockup-action-bar">
                                            <span className="mockup-btn-primary">Resolve Ticket</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "admin" && (
                        <div className="role-card-content">
                            <div className="role-card-text">
                                <div className="role-tag role-tag-admin">ADMINISTRATORS</div>
                                <h3>Total Oversight & Dynamic Work Distribution</h3>
                                <p>
                                    Complete supervisory control. Review system-wide incoming tickets,
                                    assign tickets to available agents based on category expertise, and analyze
                                    status and priority distributions.
                                </p>
                                <ul className="role-feature-list">
                                    <li><CheckCircle2 size={16} className="feature-check" /> Global ticket assignment routing</li>
                                    <li><CheckCircle2 size={16} className="feature-check" /> Category & priority metrics breakdown</li>
                                    <li><CheckCircle2 size={16} className="feature-check" /> User role management & audit oversight</li>
                                </ul>
                                <Link to="/admin/dashboard" className="btn btn-outline btn-sm">
                                    Open Admin View
                                </Link>
                            </div>
                            <div className="role-card-mockup">
                                <div className="mockup-header">
                                    <span className="mockup-dot red"></span>
                                    <span className="mockup-dot yellow"></span>
                                    <span className="mockup-dot green"></span>
                                    <span className="mockup-title">Admin Console Preview</span>
                                </div>
                                <div className="mockup-body">
                                    <div className="mockup-stat-row">
                                        <div className="mockup-stat-box">
                                            <span className="mockup-num">28</span>
                                            <span className="mockup-lbl">Total Tickets</span>
                                        </div>
                                        <div className="mockup-stat-box">
                                            <span className="mockup-num">7</span>
                                            <span className="mockup-lbl">Unassigned</span>
                                        </div>
                                    </div>
                                    <div className="mockup-progress-item">
                                        <span>Software Category (64%)</span>
                                        <div className="mockup-bar-wrap"><div className="mockup-bar" style={{ width: "64%" }}></div></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Feature Cards Grid */}
            <section className="features-grid-section">
                <div className="section-header text-center">
                    <span className="section-eyebrow">ENTERPRISE-GRADE CAPABILITIES</span>
                    <h2 className="section-title">Built for Reliability & Compliance</h2>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <Lock size={22} className="feature-icon" />
                        </div>
                        <h3>Spring Security & JWT</h3>
                        <p>
                            Stateless token authentication with BCrypt hashing and fine-grained method-level
                            authorization preventing unauthorized state manipulation.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <Layers size={22} className="feature-icon" />
                        </div>
                        <h3>Guarded State Machine</h3>
                        <p>
                            Strict lifecycle checks ensure tickets only move through valid stages:
                            Open ➔ Assigned ➔ In Progress ➔ Resolved ➔ Closed.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <Activity size={22} className="feature-icon" />
                        </div>
                        <h3>Unified Audit Trail</h3>
                        <p>
                            Every status shift, agent re-assignment, and customer interaction is recorded
                            with exact timestamps and user identifiers.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <Compass size={22} className="feature-icon" />
                        </div>
                        <h3>Dynamic Search & Filtering</h3>
                        <p>
                            Spring Data Specifications power instantaneous multi-parameter search,
                            filter by status, category, priority, and pagination.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}