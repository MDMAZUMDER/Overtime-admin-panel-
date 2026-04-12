package com.example.overtimeadmin.data.repository

import com.example.overtimeadmin.data.model.*

object MockDataRepository {
    val employees = listOf(
        Employee(
            id = 1, 
            name = "Alex Chen", 
            email = "alex.chen@company.com",
            phone = "+1 (555) 123-4567",
            department = "Engineering", 
            position = "Senior Developer",
            status = EmployeeStatus.ACTIVE, 
            hourlyRate = 45.0,
            weeklyOvertime = 6.5, 
            monthlyOvertime = 24.0,
            totalOvertime = 156.0,
            initial = "AC",
            joinDate = "Jan 15, 2022"
        ),
        Employee(
            id = 2, 
            name = "Jamie Rivera", 
            email = "jamie.r@company.com",
            phone = "+1 (555) 234-5678",
            department = "Product", 
            position = "Product Manager",
            status = EmployeeStatus.ACTIVE, 
            hourlyRate = 50.0,
            weeklyOvertime = 3.2, 
            monthlyOvertime = 12.5,
            totalOvertime = 88.0,
            initial = "JR",
            joinDate = "Mar 10, 2021"
        ),
        Employee(
            id = 3, 
            name = "Taylor Smith", 
            email = "t.smith@company.com",
            phone = "+1 (555) 345-6789",
            department = "Sales", 
            position = "Account Executive",
            status = EmployeeStatus.ON_BREAK, 
            hourlyRate = 35.0,
            weeklyOvertime = 0.0, 
            monthlyOvertime = 8.0,
            totalOvertime = 45.0,
            initial = "TS",
            joinDate = "Jun 05, 2023"
        ),
        Employee(
            id = 4, 
            name = "Morgan Lee", 
            email = "m.lee@company.com",
            phone = "+1 (555) 456-7890",
            department = "Engineering", 
            position = "QA Engineer",
            status = EmployeeStatus.ACTIVE, 
            hourlyRate = 40.0,
            weeklyOvertime = 8.0, 
            monthlyOvertime = 30.0,
            totalOvertime = 210.0,
            initial = "ML",
            joinDate = "Nov 20, 2022"
        )
    )

    val initialPendingRequests = listOf(
        OvertimeRequest(1, 1, "Alex Chen", "AC", 2.5, "Oct 12, 2023", "Urgent bug fix for production deployment."),
        OvertimeRequest(2, 2, "Jamie Rivera", "JR", 1.5, "Oct 13, 2023", "Finalizing product roadmap for Q4."),
        OvertimeRequest(3, 4, "Morgan Lee", "ML", 4.0, "Oct 14, 2023", "Server migration and infrastructure scaling.")
    )

    val weeklyTrendData = listOf(4.5, 6.0, 5.2, 7.8, 9.0, 8.5, 6.2)
}
