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
    val department: String,
    val status: EmployeeStatus,
    val weeklyOvertime: Double,
    val initial: String
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
