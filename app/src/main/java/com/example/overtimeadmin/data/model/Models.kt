package com.example.overtimeadmin.data.model

enum class EmployeeStatus {
    ACTIVE, ON_BREAK
}

enum class RequestStatus {
    PENDING, APPROVED, REJECTED
}

data class Employee(
    val id: Int,
    val name: String,
    val email: String,
    val phone: String,
    val department: String,
    val position: String,
    val status: EmployeeStatus,
    val hourlyRate: Double,
    val weeklyOvertime: Double,
    val monthlyOvertime: Double,
    val totalOvertime: Double,
    val initial: String,
    val joinDate: String
)

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
