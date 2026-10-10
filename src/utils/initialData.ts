import {
  StudyMaterial,
  PdfDocument,
  StudyTask,
  StudyPlan,
  StudySession,
  UserStats,
} from '../types';

export function getSampleMaterials(userId: string): StudyMaterial[] {
  return [
    {
      id: `sbte_java_${userId}`,
      userId,
      title: 'Java Programming: Multithreading, Exception Handling & JDBC',
      subject: 'Java Programming',
      topic: 'SBTE Bihar 5th Sem CSE - Units 4, 5 & 6',
      content: `## SBTE Bihar 5th Sem CSE: Core Java High-Yield Exam Notes

### 1. Multithreading in Java (Very Important for 6-Mark Questions)
- **Two ways to create a thread:**
  1. Extending the \`java.lang.Thread\` class.
  2. Implementing the \`java.lang.Runnable\` interface (Recommended due to multiple inheritance limitations).

\`\`\`java
class MyThread implements Runnable {
    public void run() {
        System.out.println("Thread running: " + Thread.currentThread().getName());
    }
}
public class Test {
    public static void main(String[] args) {
        Thread t1 = new Thread(new MyThread());
        t1.start(); // Invokes run() asynchronously in a new call stack
    }
}
\`\`\`

- **Thread Life Cycle Stages:**
  New $\\rightarrow$ Runnable $\\rightarrow$ Running $\\rightarrow$ Blocked/Waiting $\\rightarrow$ Terminated (Dead).
- **Synchronization:** The \`synchronized\` keyword prevents thread interference and memory consistency errors on shared resources (Monitor lock).

---

### 2. Exception Handling Hierarchy
- **Throwable** is the root class:
  - **Error**: Irrecoverable conditions (e.g., \`OutOfMemoryError\`, \`StackOverflowError\`).
  - **Exception**: Recoverable conditions:
    - *Checked Exceptions* (Compile-time): \`IOException\`, \`SQLException\`, \`ClassNotFoundException\`.
    - *Unchecked Exceptions* (Runtime): \`NullPointerException\`, \`ArithmeticException\`, \`ArrayIndexOutOfBoundsException\`.
- **Keywords:** \`try\`, \`catch\`, \`finally\` (always executes), \`throw\` (explicitly throw an exception), \`throws\` (declares exceptions in method signature).

---

### 3. JDBC (Java Database Connectivity) Architecture
1. **Load Driver**: \`Class.forName("com.mysql.cj.jdbc.Driver");\`
2. **Establish Connection**: \`Connection con = DriverManager.getConnection(url, user, pass);\`
3. **Create Statement**: \`PreparedStatement pst = con.prepareStatement("SELECT * FROM students WHERE roll = ?");\`
4. **Execute Query**: \`ResultSet rs = pst.executeQuery();\`
5. **Close Connection**: Always close in finally or try-with-resources.`,
      tags: ['SBTE Bihar', 'Java', '5th Sem CSE', 'Multithreading', 'JDBC', 'Exam Notes'],
      createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    },
    {
      id: `sbte_se_${userId}`,
      userId,
      title: 'Software Engineering: SDLC Models, SRS & Software Testing',
      subject: 'Software Engineering',
      topic: 'SBTE Bihar 5th Sem CSE - Units 1, 2, 3 & 4',
      content: `## SBTE Bihar 5th Sem CSE: Software Engineering Comprehensive Notes

### 1. Software Development Life Cycle (SDLC) Models Comparison
- **Waterfall Model**: Linear sequential flow. Requirements must be completely frozen before design. Best for well-understood, stable requirements. High risk, late testing.
- **Spiral Model**: Evolutionary, risk-driven process model. 4 quadrants: Determine Objectives, Risk Analysis, Development & Testing, Customer Evaluation.
- **Agile Model**: Iterative & incremental methodology. Continuous delivery of working software in sprints (1-4 weeks). Emphasizes collaboration over documentation.

---

### 2. Software Requirements Specification (SRS)
- **IEEE 830 Standard Characteristics of a Good SRS:**
  1. *Correct*: Accurately describes user needs.
  2. *Unambiguous*: Every requirement has only one interpretation.
  3. *Complete*: Covers all functional and non-functional specifications.
  4. *Consistent*: No conflicting requirements.
  5. *Verifiable (Testable)*: A quantifiable method exists to prove compliance.
  6. *Modifiable & Traceable*: Organized with unique requirement IDs.

---

### 3. Data Flow Diagrams (DFD) vs UML
- **DFD Symbols:** Circle/Rounded rectangle (Process), Arrow (Data Flow), Open rectangle (Data Store), Square (External Entity).
- **DFD Levels:** Level 0 (Context Diagram), Level 1 (Major subsystems), Level 2 (Detailed module flow).
- **Coupling vs Cohesion:**
  - *High Cohesion* (Desirable): Internal elements of a single module are strongly related.
  - *Low Coupling* (Desirable): Minimum interdependence between distinct modules.

---

### 4. Software Testing Techniques (Frequently Asked 6-Mark Question)
- **Black-Box Testing (Functional Testing):**
  - Tested without knowing internal code structure.
  - Methods: Boundary Value Analysis (BVA), Equivalence Class Partitioning (ECP), Cause-Effect Graphing.
- **White-Box Testing (Structural Testing):**
  - Evaluates internal code logic, branches, and paths.
  - Methods: Statement Coverage, Branch/Decision Coverage, Path Coverage, Cyclomatic Complexity ($V(G) = E - N + 2P$).`,
      tags: ['SBTE Bihar', 'Software Engg', 'SDLC', 'DFD', 'Testing', '5th Sem CSE'],
      createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    },
    {
      id: `sbte_cn_${userId}`,
      userId,
      title: 'Computer Networks & Security: OSI vs TCP/IP & IP Subnetting',
      subject: 'Computer Networks',
      topic: 'SBTE Bihar 5th Sem CSE - Units 2, 3 & 5',
      content: `## SBTE Bihar 5th Sem CSE: Computer Networks & Network Security

### 1. OSI 7 Layers vs TCP/IP 4 Layers (Guaranteed Exam Question)
| OSI Layer | Key Protocols / Devices | Core Function |
| :--- | :--- | :--- |
| **7. Application** | HTTP, FTP, SMTP, DNS | User interface & network applications |
| **6. Presentation** | SSL/TLS, JPEG, ASCII | Encryption, compression, data translation |
| **5. Session** | NetBIOS, RPC | Dialogue control & session token management |
| **4. Transport** | TCP, UDP | End-to-end delivery, port numbers, flow/error control |
| **3. Network** | IP, ICMP, OSPF, Routers | Logical IP addressing & shortest path routing |
| **2. Data Link** | Ethernet, MAC, Switches | Framing, physical MAC addressing, error detection (CRC) |
| **1. Physical** | Cables, Hubs, Repeaters | Bit stream transmission over physical media |

---

### 2. IPv4 Addressing & Subnetting Numerical
- **Address Classes:**
  - Class A: 1.0.0.0 to 126.255.255.255 (Default Mask: 255.0.0.0, /8)
  - Class B: 128.0.0.0 to 191.255.255.255 (Default Mask: 255.255.0.0, /16)
  - Class C: 192.0.0.0 to 223.255.255.255 (Default Mask: 255.255.255.0, /24)
  - Loopback: 127.0.0.1
- **Subnet Calculation Example (Given in SBTE 2022 exam):**
  - Network: \`192.168.1.0/26\`
  - Borrowed host bits: $26 - 24 = 2$ bits.
  - Number of subnets: $2^2 = 4$ subnets.
  - Number of usable hosts per subnet: $2^{32 - 26} - 2 = 2^6 - 2 = 62$ hosts.
  - Subnet Mask: \`255.255.255.192\`

---

### 3. Network Security & Cryptography
- **Symmetric Key Cryptography (Private Key):** Single shared key for encryption & decryption (e.g., DES, 3DES, AES). Fast, but secure key exchange is challenging.
- **Asymmetric Key Cryptography (Public Key):** Key pair consisting of Public Key (encryption) and Private Key (decryption). Example: **RSA Algorithm**.
- **Firewall:** Hardware or software system that monitors and filters incoming and outgoing network traffic based on predetermined security rules.`,
      tags: ['SBTE Bihar', 'Computer Networks', 'OSI Model', 'Subnetting', 'Cryptography'],
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: `sbte_python_${userId}`,
      userId,
      title: 'Python Programming: OOP, Exception Handling & Data Structures',
      subject: 'Python Programming',
      topic: 'SBTE Bihar 5th Sem CSE - Units 2, 3 & 4',
      content: `## SBTE Bihar 5th Sem CSE: Python Programming Key Highlights

### 1. Built-in Data Structures Comparison
- **List**: Mutable, ordered sequence, allows duplicates (\`my_list = [1, 2, "apple"]\`).
- **Tuple**: Immutable, ordered, faster than lists (\`my_tuple = (10, 20, 30)\`).
- **Set**: Mutable, unordered, unique elements only (\`my_set = {1, 2, 3}\`).
- **Dictionary**: Key-value pairs, keys must be immutable (\`my_dict = {"roll": 101, "name": "Rohan"}\`).

---

### 2. Object-Oriented Programming (OOP) in Python
\`\`\`python
class Student:
    # Constructor
    def __init__(self, name, roll_no, branch="CSE"):
        self.name = name
        self.roll_no = roll_no
        self.branch = branch

    def display_details(self):
        print(f"Student: {self.name} | Roll: {self.roll_no} | Branch: {self.branch}")

# Inheritance
class DiplomaStudent(Student):
    def __init__(self, name, roll_no, semester=5):
        super().__init__(name, roll_no)
        self.semester = semester

s1 = DiplomaStudent("Amit Kumar", 2018501, 5)
s1.display_details()
\`\`\`

---

### 3. File Handling in Python
- Modes: \`'r'\` (read), \`'w'\` (write, overwrites), \`'a'\` (append), \`'r+'\` (read/write).
- Best practice with context manager:
\`\`\`python
with open("bihar_sbte_syllabus.txt", "r") as file:
    lines = file.readlines()
    for line in lines:
        print(line.strip())
\`\`\``,
      tags: ['SBTE Bihar', 'Python', 'OOP', 'Data Structures', '5th Sem CSE'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `sbte_cloud_iot_${userId}`,
      userId,
      title: 'Cloud Computing & IoT: Virtualization, SPI Model & Architecture',
      subject: 'Cloud Computing',
      topic: 'SBTE Bihar 5th Sem CSE - Units 1, 2 & IoT Integration',
      content: `## SBTE Bihar 5th Sem CSE: Cloud Computing & IoT Essentials

### 1. Cloud Service Delivery Models (SPI Model)
1. **IaaS (Infrastructure as a Service)**: Provides virtualized computing resources, storage, and networking over the internet (e.g., AWS EC2, Google Compute Engine). User manages OS and apps.
2. **PaaS (Platform as a Service)**: Delivers hardware and software tools needed for application development (e.g., Google App Engine, Heroku). User manages only application code.
3. **SaaS (Software as a Service)**: Complete software applications accessed through web browser (e.g., Google Workspace, Microsoft 365, Salesforce).

---

### 2. Cloud Deployment Models
- **Public Cloud**: Open to public access on pay-per-use basis (AWS, Azure).
- **Private Cloud**: Dedicated exclusively to a single organization (higher security).
- **Hybrid Cloud**: Combines public and private clouds bound by standardized technology.
- **Community Cloud**: Shared by multiple organizations with common compliance or mission requirements.

---

### 3. IoT (Internet of Things) 4-Layer Architecture
1. **Sensing Layer**: Sensors (temperature, ultrasonic, PIR) & Actuators (motors, relays).
2. **Network Layer**: Gateways, communication protocols (MQTT, CoAP, Zigbee, Bluetooth).
3. **Data Processing Layer**: Cloud storage, analytics, Edge Computing.
4. **Application Layer**: Smart City, Healthcare, Smart Agriculture monitoring dashboards.`,
      tags: ['SBTE Bihar', 'Cloud Computing', 'IoT', 'IaaS PaaS SaaS', '5th Sem CSE'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export function getSamplePdfs(userId: string): PdfDocument[] {
  return [
    {
      id: `pdf_sbte_java_${userId}`,
      userId,
      title: 'SBTE Bihar 5th Sem CSE Java Programming Handout & PYQs.pdf',
      fileName: 'SBTE_Bihar_CSE_501_Java_Programming.pdf',
      fileSize: 3820000,
      pageCount: 36,
      subject: 'Java Programming',
      topics: ['JVM Architecture', 'Multithreading', 'JDBC', 'Exception Handling', 'Swing & AWT', 'Collections'],
      extractedText: `State Board of Technical Education (SBTE) Bihar - Diploma in Computer Science & Engineering (Semester V)
Course: Java Programming (Code: 2018501)
SYLLABUS & PREVIOUS YEAR QUESTIONS (2019-2023):
Unit 1: Java Basics, JVM architecture, Bytecode execution, JRE vs JDK.
Unit 2: Object-Oriented Principles, Constructors, this and static keywords, Method Overloading.
Unit 3: Inheritance, super keyword, Dynamic Method Dispatch, Abstract classes, Interface vs Abstract Class.
Unit 4: Package creation, CLASSPATH, Exception Handling (try, catch, finally, throw, throws, custom exceptions).
Unit 5: Multithreading, Thread lifecycle, Thread class vs Runnable interface, Thread priorities, Synchronization (synchronized block/method).
Unit 6: JDBC Driver types (Type 1, 2, 3, 4), Connection, Statement, PreparedStatement, CallableStatement, ResultSet handling.
Previous Year Short Questions:
Q1. Differentiate between method overloading and method overriding in Java.
Q2. What is the role of JVM in platform independence?
Q3. Explain the life cycle of a Thread in Java with a neat state diagram.
Q4. Write a Java program to handle divide-by-zero ArithmeticException.`,
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
    {
      id: `pdf_sbte_se_${userId}`,
      userId,
      title: 'SBTE Bihar Software Engineering Question Bank & Notes.pdf',
      fileName: 'SBTE_Bihar_CSE_502_Software_Engineering.pdf',
      fileSize: 2950000,
      pageCount: 28,
      subject: 'Software Engineering',
      topics: ['SDLC Models', 'SRS Documentation', 'DFD & UML', 'Black-Box Testing', 'White-Box Testing', 'COCOMO'],
      extractedText: `SBTE Bihar - Diploma Semester 5 CSE: Software Engineering (Code: 2018502)
Comprehensive Exam Question Bank:
Q1. Explain the Waterfall model with its advantages, disadvantages, and phases.
Q2. What are the desirable characteristics of a Software Requirements Specification (SRS) as per IEEE 830?
Q3. Differentiate between Black-Box and White-Box testing with appropriate examples.
Q4. Define Coupling and Cohesion. Why is high cohesion and low coupling desirable in modular design?
Q5. Explain Basic and Intermediate COCOMO models for software cost and effort estimation.
Q6. Draw Level 0 (Context Diagram) and Level 1 DFD for an Online Examination Management System.`,
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    },
    {
      id: `pdf_sbte_cn_${userId}`,
      userId,
      title: 'SBTE Bihar Computer Networks & Cyber Security Guide.pdf',
      fileName: 'SBTE_Bihar_CSE_503_Computer_Networks.pdf',
      fileSize: 3410000,
      pageCount: 32,
      subject: 'Computer Networks',
      topics: ['OSI 7 Layers', 'TCP/IP', 'IPv4 Subnetting', 'Routing Algorithms', 'RSA Algorithm', 'Firewalls'],
      extractedText: `SBTE Bihar Diploma Engineering - Semester V CSE: Computer Networks (Code: 2018503)
Unit-wise Key Concepts:
1. Comparison between OSI Reference Model and TCP/IP Model with layer duties.
2. Network Topologies: Star, Mesh, Bus, Ring.
3. Transmission Media: Guided (Twisted Pair, Coaxial, Optical Fiber) vs Unguided (Radio, Microwave, Infrared).
4. Subnetting formulas and host range calculation for Classless Inter-Domain Routing (CIDR).
5. TCP vs UDP: Connection-oriented vs Connectionless, 3-way handshake sequence.
6. Cryptography: Symmetric (DES, AES) vs Asymmetric (RSA), Digital Signatures, Firewall working principles.`,
      createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    },
    {
      id: `pdf_sbte_py_cloud_${userId}`,
      userId,
      title: 'SBTE Bihar Python & Cloud Computing Lab Manual.pdf',
      fileName: 'SBTE_Bihar_CSE_Python_Cloud_Lab.pdf',
      fileSize: 2600000,
      pageCount: 22,
      subject: 'Python Programming',
      topics: ['Python Syntax', 'List Comprehensions', 'File I/O', 'Virtualization', 'Cloud Service Models'],
      extractedText: `SBTE Bihar Diploma CSE 5th Semester: Python Programming & Cloud Computing Laboratory Manual
Practical Experiments:
Experiment 1: Write a Python program to perform matrix multiplication using nested lists.
Experiment 2: Implement a Python class for Bank Account with deposit, withdraw, and check balance methods.
Experiment 3: Python program to count words and lines in a text file.
Experiment 4: Create a virtual machine instance on cloud platform and test connectivity.
Experiment 5: Configure an IoT temperature sensor data simulator using Python.`,
      createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 120).toISOString(),
    },
  ];
}

export function getSampleTasks(userId: string): StudyTask[] {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const inThreeDays = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
  const inFiveDays = new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0];
  const inSevenDays = new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  return [
    {
      id: `task_sbte_1_${userId}`,
      userId,
      title: 'Solve SBTE 2023 Java Programming PYQ (Group A, B, C questions)',
      subject: 'Java Programming',
      topic: 'Multithreading & Exception Handling',
      dueDate: tomorrow,
      priority: 'high',
      status: 'pending',
      estimatedMinutes: 60,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `task_sbte_2_${userId}`,
      userId,
      title: 'Draw DFD Level 0, 1, 2 for Library Management System (Software Engg)',
      subject: 'Software Engineering',
      topic: 'DFD & Structure Charts',
      dueDate: inThreeDays,
      priority: 'high',
      status: 'in_progress',
      estimatedMinutes: 45,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `task_sbte_3_${userId}`,
      userId,
      title: 'Practice IP Subnetting numericals for 192.168.10.0/26 and /28',
      subject: 'Computer Networks',
      topic: 'IPv4 Addressing & CIDR',
      dueDate: inFiveDays,
      priority: 'high',
      status: 'pending',
      estimatedMinutes: 40,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `task_sbte_4_${userId}`,
      userId,
      title: 'Write Java JDBC program connecting MySQL and executing SELECT query',
      subject: 'Java Programming',
      topic: 'JDBC Connection Steps',
      dueDate: inSevenDays,
      priority: 'medium',
      status: 'pending',
      estimatedMinutes: 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `task_sbte_5_${userId}`,
      userId,
      title: 'Prepare 5-mark short notes: Waterfall vs Agile, TCP vs UDP, Overloading vs Overriding',
      subject: 'Software Engineering',
      topic: 'Exam Short Notes Revision',
      dueDate: yesterday,
      priority: 'medium',
      status: 'completed',
      estimatedMinutes: 45,
      completedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export function getSamplePlan(userId: string): StudyPlan {
  const inThreeWeeks = new Date(Date.now() + 86400000 * 25).toISOString().split('T')[0];

  return {
    id: `plan_sbte_5th_cse_${userId}`,
    userId,
    title: 'SBTE Bihar Diploma 5th Sem CSE Board Exam Sprint (30-Day Plan)',
    examDate: inThreeWeeks,
    dailyStudyHours: 4.0,
    subjects: [
      'Java Programming',
      'Software Engineering',
      'Computer Networks',
      'Python Programming',
      'Cloud Computing',
    ],
    summary: 'Focused syllabus roadmap based on State Board of Technical Education (SBTE) Bihar pattern. Prioritizes 6-mark long questions, 4-mark short questions, and numerical problems.',
    strategyTips: [
      'Solve previous 5 years SBTE question papers (2019 to 2023)',
      'Draw neat labeled diagrams for OSI model, Thread lifecycle, and DFDs to secure full marks',
      'Dedicate 50-minute Pomodoro study blocks with 10-minute active recall breaks',
      'Practice writing Java and Python code syntax on paper as required in board theory exams',
    ],
    status: 'active',
    schedule: [
      {
        dayNumber: 1,
        dateOffsetDays: 0,
        subject: 'Java Programming',
        topic: 'Thread Life Cycle, Runnable Interface & Synchronization',
        durationMinutes: 90,
        priority: 'high',
        objectives: ['Master thread state diagram', 'Write synchronized bank account code', 'Solve SBTE 2021 Question 4'],
        studyTechnique: 'Code Implementation + Active Recall',
        completed: true,
      },
      {
        dayNumber: 2,
        dateOffsetDays: 1,
        subject: 'Software Engineering',
        topic: 'SDLC Models (Waterfall, Spiral, Agile) & SRS IEEE 830',
        durationMinutes: 90,
        priority: 'high',
        objectives: ['Compare Waterfall vs Spiral', 'Memorize 6 qualities of good SRS', 'Write SRS outline for Hospital App'],
        studyTechnique: 'Comparative Diagram Synthesis',
        completed: false,
      },
      {
        dayNumber: 3,
        dateOffsetDays: 2,
        subject: 'Computer Networks',
        topic: 'OSI 7 Layers vs TCP/IP & Protocols',
        durationMinutes: 90,
        priority: 'high',
        objectives: ['Draw 7 layers diagram with protocols', 'Explain Flow control vs Error control', 'Differentiate TCP vs UDP'],
        studyTechnique: 'Feynman Technique & Flashcards',
        completed: false,
      },
      {
        dayNumber: 4,
        dateOffsetDays: 3,
        subject: 'Java Programming',
        topic: 'JDBC Architecture & CRUD Operations',
        durationMinutes: 80,
        priority: 'high',
        objectives: ['Memorize 5 JDBC connection steps', 'Write PreparedStatement program', 'Review 4 driver types'],
        studyTechnique: 'Code Walkthrough',
        completed: false,
      },
      {
        dayNumber: 5,
        dateOffsetDays: 4,
        subject: 'Computer Networks',
        topic: 'IPv4 Subnetting & CIDR Numericals',
        durationMinutes: 85,
        priority: 'high',
        objectives: ['Solve 5 subnetting numericals', 'Find network address, broadcast address, and valid host range'],
        studyTechnique: 'Problem-Solving Drills',
        completed: false,
      },
      {
        dayNumber: 6,
        dateOffsetDays: 5,
        subject: 'Software Engineering',
        topic: 'Black-Box Testing (BVA, ECP) vs White-Box Testing',
        durationMinutes: 75,
        priority: 'medium',
        objectives: ['Explain Boundary Value Analysis', 'Calculate Cyclomatic Complexity V(G)'],
        studyTechnique: 'Question-Answer Practice',
        completed: false,
      },
      {
        dayNumber: 7,
        dateOffsetDays: 6,
        subject: 'Python Programming',
        topic: 'OOP in Python: Classes, Inheritance & File Handling',
        durationMinutes: 80,
        priority: 'medium',
        objectives: ['Implement __init__ constructor', 'Write file word-counter script'],
        studyTechnique: 'Hands-on Programming',
        completed: false,
      },
      {
        dayNumber: 8,
        dateOffsetDays: 7,
        subject: 'Cloud Computing',
        topic: 'SPI Model (SaaS, PaaS, IaaS) & IoT 4-Layer Architecture',
        durationMinutes: 70,
        priority: 'medium',
        objectives: ['Differentiate IaaS, PaaS, SaaS with cloud examples', 'Explain IoT sensors and protocols'],
        studyTechnique: 'Concept Mapping',
        completed: false,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function getSampleStats(userId: string): UserStats {
  const today = new Date().toISOString().split('T')[0];
  return {
    userId,
    currentStreak: 6,
    longestStreak: 14,
    lastStudyDate: today,
    totalStudyMinutes: 890, // ~14.8 hours
    completedTasksCount: 18,
    updatedAt: new Date().toISOString(),
  };
}
