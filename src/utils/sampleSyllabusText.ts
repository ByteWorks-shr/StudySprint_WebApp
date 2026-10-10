/**
 * Official Sample Syllabus Text: SBTE Bihar Diploma in Computer Science & Engineering - Semester V
 * Used for instant testing and demonstration of the AI Syllabus Explainer.
 */
export const SAMPLE_SBTE_5TH_SEM_SYLLABUS = `STATE BOARD OF TECHNICAL EDUCATION (SBTE), BIHAR
CURRICULUM AND DETAILED SYLLABUS FOR DIPLOMA IN COMPUTER SCIENCE & ENGINEERING
SEMESTER: V (FIFTH SEMESTER) | ACADEMIC SCHEME: 2023-2026 REGULATION

PROGRAM OUTCOMES & OBJECTIVES:
The 5th Semester of Diploma in CSE aims to equip students with enterprise-grade software development skills, full-stack object-oriented programming in Java, robust software engineering principles, computer networking protocols, practical Python programming, and hands-on micro-project execution.

========================================================================
TEACHING AND EXAMINATION SCHEME (SEMESTER - V)
========================================================================
1. Java Programming (Course Code: 2018501)
   - Theory: 4 Hours/Week, Credits: 4
   - Marks: End Semester Exam (ESE) = 70 Marks (Duration: 3 Hours)
            Internal Assessment (IA) / Teacher Assessment (TA) = 10 Marks
            Class Test (CT) = 20 Marks
            Total Theory Marks = 100 Marks
   - Lab Practical (Course Code: 2018506): 2 Hours/Week, Credits: 1, Practical Marks = 50 Marks (Internal: 15, External: 35)
   - Term Work / TW (Course Code: 2018508): Credits: 1, Total Term Work Marks = 25 Marks

2. Software Engineering (Course Code: 2018502)
   - Theory: 3 Hours/Week, Credits: 3
   - Marks: ESE = 70 Marks, IA = 10 Marks, CT = 20 Marks, Total = 100 Marks
   - Term Work / Project Documentation: 25 Marks

3. Computer Networks (Course Code: 2018503)
   - Theory: 3 Hours/Week, Credits: 3
   - Marks: ESE = 70 Marks, IA = 10 Marks, CT = 20 Marks, Total = 100 Marks
   - Lab Practical (Course Code: 2018507): 2 Hours/Week, Practical Marks = 50 Marks

4. Python Programming & Web Development (Course Code: 2018504)
   - Theory: 3 Hours/Week, Credits: 3
   - Lab Practical (Course Code: 2018508): 2 Hours/Week, Practical Marks = 50 Marks

5. Academic Micro-Project & Professional Practice (Course Code: 2018505)
   - Practical & Presentation: 4 Hours/Week, Credits: 2
   - Term Work & Viva Voce: 50 Marks (Internal: 25, External: 25)

========================================================================
DETAILED SUBJECT SYLLABUS
========================================================================

SUBJECT 1: JAVA PROGRAMMING (COURSE CODE: 2018501)
Subject Overview:
Provides deep foundations in Java object-oriented programming, bytecode JVM architecture, multithreading, robust exception handling, Java Collection Framework, and Database Connectivity (JDBC).

Unit 1: Introduction to Java Environment & OOP Fundamentals (08 Hours)
- Topics: History and evolution of Java; Features of Java: Platform Independence, Bytecode, JVM, JRE, JDK; Architecture of JVM; Data Types, Variables, Arrays; Control Statements (if-else, switch-case, loops); Object-Oriented Principles: Class, Object, Methods, Constructors, Constructor Overloading, 'this' keyword, Garbage Collection and finalize() method.
- Prerequisites: Basics of C or C++ programming.
- Course Outcome: CO1 - Formulate object-oriented programs utilizing classes, objects, and constructors.

Unit 2: Inheritance, Polymorphism and Interfaces (10 Hours)
- Topics: Types of Inheritance (Single, Multilevel, Hierarchical); 'super' keyword; Method Overriding; Dynamic Method Dispatch (Runtime Polymorphism); Abstract classes and methods; 'final' keyword with variables, methods, and classes; Interfaces: Defining, implementing, and extending interfaces; Multiple inheritance using interfaces; Packages: Built-in packages, User-defined packages, CLASSPATH configuration.
- Prerequisites: Unit 1 concepts.
- Course Outcome: CO2 - Implement code reusability through inheritance and modularize code using packages and interfaces.

Unit 3: Exception Handling and Multithreading (12 Hours)
- Topics: Exception Hierarchy in Java (Throwable, Error, Exception); Checked vs Unchecked Exceptions; Keywords: try, catch, finally, throw, throws; Creating custom user-defined exceptions; Multithreading concepts: Process vs Thread; Thread lifecycle (New, Runnable, Running, Blocked, Terminated); Creating threads using Thread class and Runnable interface; Thread priorities; Thread Synchronization: synchronized methods, synchronized blocks, Inter-thread communication (wait(), notify(), notifyAll()).
- Exam Weightage: 18-20 Marks in ESE (Very High Yield).
- Course Outcome: CO3 - Develop multi-threaded and crash-resilient applications using robust exception handling.

Unit 4: Java Collections Framework & Input/Output Streams (10 Hours)
- Topics: I/O Streams: Byte Streams (FileInputStream, FileOutputStream) and Character Streams (FileReader, FileWriter); Serialization and Deserialization; Java Collections Framework overview: List interface (ArrayList, LinkedList, Vector), Set interface (HashSet, TreeSet), Map interface (HashMap, TreeMap); Iterator and ListIterator; Generics introduction.
- Course Outcome: CO4 - Organize dynamic in-memory data structures using Java Collection classes.

Unit 5: JDBC (Java Database Connectivity) & GUI Basics (10 Hours)
- Topics: JDBC Architecture; JDBC Driver Types (Type-1 to Type-4); Establishing Database Connection (DriverManager, Connection); Statement, PreparedStatement, CallableStatement; ResultSet processing; Executing SQL DDL and DML queries from Java; Basics of AWT and Swing components (JFrame, JButton, JTextField, Event Handling introduction).
- Course Outcome: CO5 - Connect Java desktop applications to relational databases for persistent record management.

LAB EXPERIMENTS FOR JAVA PROGRAMMING (COURSE CODE: 2018506):
1. Practical 1: Write a Java program to implement class, constructors, and method overloading.
2. Practical 2: Implement Single and Multilevel Inheritance with 'super' keyword demonstration.
3. Practical 3: Demonstrate dynamic method dispatch and runtime polymorphism using Abstract classes.
4. Practical 4: Create a user-defined package and import it across different packages.
5. Practical 5: Write a program to handle multiple exceptions using nested try-catch-finally blocks.
6. Practical 6: Create a user-defined Custom Exception class for Student Age/Mark validation.
7. Practical 7: Implement multithreading by extending Thread class and implementing Runnable interface.
8. Practical 8: Demonstrate thread synchronization on a shared Bank Account transaction resource.
9. Practical 9: Perform File copy operation using FileInputStream and FileOutputStream.
10. Practical 10: Build a complete JDBC CRUD Application (Insert, View, Update, Delete) with MySQL/SQLite.
All practicals require a well-documented Practical Record Journal certified by the subject teacher.

------------------------------------------------------------------------

SUBJECT 2: SOFTWARE ENGINEERING (COURSE CODE: 2018502)
Subject Overview:
Focuses on systematic software engineering lifecycle methodologies, requirement analysis, software architecture design, quality assurance, testing strategies, and project estimation.

Unit 1: Introduction to Software Engineering & SDLC Models (08 Hours)
- Topics: Software crisis and software engineering definition; Software attributes; Software Development Life Cycle (SDLC) phases; Process Models: Classical Waterfall Model, Iterative Waterfall Model, Prototyping Model, Evolutionary Model, Spiral Model (Risk analysis), Agile Development methodology (Scrum framework, Sprints, Agile Manifesto).
- Prerequisites: None.

Unit 2: Software Requirements Engineering & SRS (10 Hours)
- Topics: Requirement engineering process: Inception, Elicitation, Elaboration, Negotiation, Specification, Validation; Functional vs Non-Functional Requirements; Software Requirement Specification (SRS) document structure (IEEE 830 standard characteristics: Correct, Unambiguous, Complete, Consistent, Verifiable, Modifiable, Traceable); Use Case modeling and Data Flow Diagrams (DFD Level 0, Level 1, Level 2).

Unit 3: Software Design Concepts & Architecture (08 Hours)
- Topics: Software design principles; Modularity, Abstraction, Information Hiding; Cohesion and Coupling (Types of Cohesion and Types of Coupling, High Cohesion and Low Coupling objective); Architectural styles; Object-Oriented Design using UML (Class diagrams, Sequence diagrams, Activity diagrams).

Unit 4: Software Testing & Quality Assurance (12 Hours)
- Topics: Verification vs Validation; Fault, Failure, and Bug; Testing techniques: Black-Box Testing (Equivalence Class Partitioning, Boundary Value Analysis, Cause-Effect Graphing) and White-Box Testing (Basis Path Testing, Cyclomatic Complexity calculation, Control Structure Testing); Levels of Testing: Unit Testing, Integration Testing (Top-Down, Bottom-Up), System Testing, Acceptance Testing; Alpha and Beta testing; Software Quality metrics and CMMI levels.

Unit 5: Software Project Estimation & Maintenance (07 Hours)
- Topics: Software project management; Cost estimation: Decomposition techniques, Empirical estimation models (COCOMO Model - Basic, Intermediate, Detailed); Software risk management; Software maintenance types (Corrective, Adaptive, Perfective, Preventive); Reverse engineering.

------------------------------------------------------------------------

SUBJECT 3: COMPUTER NETWORKS (COURSE CODE: 2018503)
Subject Overview:
Explores data communications, reference models (OSI and TCP/IP), physical transmission media, data link layer framing & error detection, network layer IPv4/IPv6 routing, transport layer TCP/UDP, and application layer protocols.

Unit 1: Introduction to Data Communication & Network Models (08 Hours)
- Topics: Data communication components; Network topologies (Mesh, Star, Bus, Ring, Hybrid); Network categories (LAN, MAN, WAN); OSI Reference Model (7 Layers: Physical, Data Link, Network, Transport, Session, Presentation, Application with functions of each layer); TCP/IP Protocol Suite comparison with OSI model.

Unit 2: Physical & Data Link Layer (10 Hours)
- Topics: Transmission media (Twisted pair, Coaxial, Optical Fiber, Wireless); Data Link Layer design issues: Framing (Character count, Byte stuffing, Bit stuffing); Error detection and correction (Parity, Checksum, CRC - Cyclic Redundancy Check, Hamming Code); Flow Control: Stop-and-Wait ARQ, Sliding Window protocols (Go-Back-N, Selective Repeat); Multiple Access Protocols: ALOHA, CSMA/CD (Ethernet), CSMA/CA.

Unit 3: Network Layer & IP Addressing (12 Hours)
- Topics: Network layer services; Virtual Circuits vs Datagram Networks; IPv4 Addressing: Classful Addressing (Classes A, B, C, D, E), Classless Addressing (CIDR), Subnetting and Subnet Mask calculation; IPv6 addressing introduction; Routing Algorithms: Distance Vector Routing (Bellman-Ford), Link State Routing (Dijkstra's Algorithm); Routing protocols overview (RIP, OSPF, BGP).

Unit 4: Transport Layer Protocols (08 Hours)
- Topics: Transport layer duties: Port addressing, Multiplexing and Demultiplexing; Connectionless UDP (User Datagram Protocol) vs Connection-Oriented TCP (Transmission Control Protocol); TCP 3-Way Handshake connection establishment and termination; TCP Flow control and Congestion control mechanisms.

Unit 5: Application Layer & Network Security (07 Hours)
- Topics: DNS (Domain Name System); DHCP; HTTP and HTTPS; Email protocols: SMTP, POP3, IMAP; FTP; Telnet vs SSH; Basics of Network Security: Symmetric vs Asymmetric Cryptography (DES, AES, RSA), Firewalls, Packet filtering.

LAB EXPERIMENTS FOR COMPUTER NETWORKS (COURSE CODE: 2018507):
1. Practical 1: Study of different Network cables (Cat5, Cat6, Fiber) and RJ-45 crimping practice (Straight and Crossover cables).
2. Practical 2: Configure a Local Area Network (LAN) using Cisco Packet Tracer or network hub/switch.
3. Practical 3: Basic Network CLI commands troubleshooting: ping, traceroute, ipconfig/ifconfig, netstat, nslookup, arp.
4. Practical 4: Implement Cyclic Redundancy Check (CRC) error detection program.
5. Practical 5: Demonstrate Subnetting and calculate network address, broadcast address, and host ranges.
6. Practical 6: Packet sniffing and protocol analysis using Wireshark (capture TCP, HTTP, DNS packets).
7. Practical 7: Configure Static Routing and Dynamic Routing (RIP) using Packet Tracer.

------------------------------------------------------------------------

SUBJECT 4: PYTHON PROGRAMMING (COURSE CODE: 2018504)
Subject Overview:
Modern interpreted programming in Python, data structures, functional modules, file operations, OOP, and web/database integration.

Unit 1: Python Basics & Control Structures (07 Hours)
- Topics: Python features, installation, interactive shell vs script mode; Data types, operators, precedence; Conditional statements and loops; Functions: defining, parameters, default arguments, lambda functions.

Unit 2: Data Structures in Python (08 Hours)
- Topics: Strings and string slicing; Lists (creation, indexing, methods, list comprehension); Tuples; Sets; Dictionaries (key-value pairs, nested dictionaries, dictionary methods).

Unit 3: Modules, Packages & File Handling (08 Hours)
- Topics: Importing modules (math, random, sys, os); Creating custom modules and packages; File I/O: Reading and writing text and CSV files; Exception handling with try-except-finally blocks.

Unit 4: Object-Oriented Programming in Python (08 Hours)
- Topics: Classes, Objects, __init__ constructor, instance methods; Inheritance in Python; Method overriding; Operator overloading; Encapsulation and private attributes.

Unit 5: Python for Web & Data Access (09 Hours)
- Topics: Introduction to SQLite3 with Python; Connecting, creating tables, executing queries; Introduction to Flask or Django web framework basics (routes, request handling, rendering HTML templates).

LAB PRACTICALS FOR PYTHON (COURSE CODE: 2018508):
- 10 structured programming exercises covering lists, dictionaries, file parsing, OOP classes, SQLite database CRUD operations, and a mini Flask web page.

------------------------------------------------------------------------

TERM WORK & CONTINUOUS ASSESSMENT REQUIREMENTS (TW - 2018508):
Term work components to be maintained and submitted before semester-end:
1. Java Programming Practical Journal: 10 completed and executed laboratory programs with outputs and teacher signatures.
2. Software Engineering Case Study Assignment: Complete SRS Document and UML Diagrams (Class diagram, Sequence diagram) for an assigned problem statement (e.g. Hospital Management System or Library System).
3. Computer Networks Journal: Network topology diagrams, Packet Tracer simulation screenshots, and CLI command outputs.
4. Python Programming Assignment Portfolio: Cleanly commented source code and sample execution outputs.
Evaluation: Term work marks are awarded based on timely completion, viva voce, journal neatness, and conceptual clarity. Minimum 40% passing in Term Work is mandatory to appear in External Practical Examination.

------------------------------------------------------------------------

ACADEMIC MICRO-PROJECT REQUIREMENTS (COURSE CODE: 2018505):
Objectives:
To foster teamwork, technical synthesis, independent problem-solving, and practical application of 5th semester subjects.

Rules & Guidelines:
1. Group Size: Groups of 3 to 4 students.
2. Domain: The micro-project must apply concepts from Java Programming (GUI/JDBC), Python, Web Development, or Computer Networking.
3. Five Project Lifecycle Milestones:
   - Milestone 1: Topic Selection and Problem Statement Approval (Week 2-3).
   - Milestone 2: Requirements Specification & System Architecture Planning (Week 5).
   - Milestone 3: Core Implementation & Coding (Week 8-10).
   - Milestone 4: System Testing & Bug Fixing (Week 12).
   - Milestone 5: Project Report Documentation, Code Packaging, and Presentation/Viva Voce (Week 14).
4. Deliverables:
   - Working Software Application source code.
   - Formal Project Report (15-25 pages) including Abstract, Objectives, SRS, Architecture/DFD, Screenshots, and Conclusion.
   - Presentation slides (PPT) for external examiner viva voce.
5. Evaluation Criteria:
   - Problem Relevance & Innovation: 10 Marks
   - Code Quality & Implementation: 15 Marks
   - Project Report & Documentation: 10 Marks
   - Presentation & Viva Voce: 15 Marks
   - Total Marks: 50 Marks (25 Internal + 25 External Examiner)
`;
