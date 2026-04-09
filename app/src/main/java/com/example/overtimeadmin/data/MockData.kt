// File: app/src/main/java/com/example/overtimeadmin/data/MockData.kt
package com.example.overtimeadmin.data

import androidx.compose.ui.graphics.Color

data class Employee(
    val id: Int,
    val name: String,
    val department: String,
    val status: EmployeeStatus,
    val weeklyOvertime: Double,
    val initial: String
)

enum class EmployeeStatus {
    ACTIVE, ON_BREAK
}

data class OvertimeRequest(
    val id: Int,
    val employeeId: Int,
    val employeeName: String,
    val employeeInitial: String,
    val hours: Double,
    val date: String,
    val reason: String,
    val status: RequestStatus = RequestStatus.PENDING
)

enum class RequestStatus {
    PENDING, APPROVED, REJECTED
}

object MockData {
    val employees = listOf(
        Employee(1, "Alex Chen", "Engineering", EmployeeStatus.ACTIVE, 6.5, "AC"),
        Employee(2, "Jamie Rivera", "Product", EmployeeStatus.ACTIVE, 3.2, "JR"),
        Employee(3, "Taylor Smith", "Sales", EmployeeStatus.ON_BREAK, 0.0, "TS"),
        Employee(4, "Morgan Lee", "Engineering", EmployeeStatus.ACTIVE, 8.0, "ML")
    )

    val initialPendingRequests = listOf(
        OvertimeRequest(1, 1, "Alex Chen", "AC", 2.5, "Oct 12, 2023", "Urgent bug fix for production deployment."),
        OvertimeRequest(2, 2, "Jamie Rivera", "JR", 1.5, "Oct 13, 2023", "Finalizing product roadmap for Q4."),
        OvertimeRequest(3, 4, "Morgan Lee", "ML", 4.0, "Oct 14, 2023", "Server migration and infrastructure scaling.")
    )

    val weeklyTrendData = listOf(4.5, 6.0, 5.2, 7.8, 9.0, 8.5, 6.2)
}
