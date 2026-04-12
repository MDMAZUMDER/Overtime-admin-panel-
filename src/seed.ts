import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const mockEmployees = [
  {
    name: "Alex Chen",
    email: "alex.chen@company.com",
    department: "Engineering",
    position: "Senior Frontend Developer",
    status: "ACTIVE",
    hourlyRate: 45,
    joinDate: "2023-01-15",
    photoUrl: "https://i.pravatar.cc/150?u=alex"
  },
  {
    name: "Sarah Jenkins",
    email: "sarah.j@company.com",
    department: "Design",
    position: "Product Designer",
    status: "ACTIVE",
    hourlyRate: 40,
    joinDate: "2023-03-20",
    photoUrl: "https://i.pravatar.cc/150?u=sarah"
  },
  {
    name: "Michael Ross",
    email: "m.ross@company.com",
    department: "Operations",
    position: "Ops Manager",
    status: "ON_BREAK",
    hourlyRate: 50,
    joinDate: "2022-11-10",
    photoUrl: "https://i.pravatar.cc/150?u=michael"
  }
];

const mockRequests = [
  {
    employeeId: "temp_1",
    employeeName: "Alex Chen",
    date: "2023-10-12",
    hours: 4.5,
    reason: "Critical bug fix for the production release.",
    status: "PENDING",
    createdAt: serverTimestamp()
  },
  {
    employeeId: "temp_2",
    employeeName: "Sarah Jenkins",
    date: "2023-10-11",
    hours: 2.0,
    reason: "Finalizing design assets for the new dashboard.",
    status: "APPROVED",
    createdAt: serverTimestamp()
  }
];

export async function seedDatabase() {
  try {
    for (const emp of mockEmployees) {
      await addDoc(collection(db, 'employees'), emp);
    }
    for (const req of mockRequests) {
      await addDoc(collection(db, 'requests'), req);
    }
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
