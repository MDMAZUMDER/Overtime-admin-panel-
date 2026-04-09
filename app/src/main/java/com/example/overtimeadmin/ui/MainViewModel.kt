// File: app/src/main/java/com/example/overtimeadmin/ui/MainViewModel.kt
package com.example.overtimeadmin.ui

import androidx.lifecycle.ViewModel
import com.example.overtimeadmin.data.Employee
import com.example.overtimeadmin.data.MockData
import com.example.overtimeadmin.data.OvertimeRequest
import com.example.overtimeadmin.data.RequestStatus
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

class MainViewModel : ViewModel() {

    private val _pendingRequests = MutableStateFlow(MockData.initialPendingRequests)
    val pendingRequests: StateFlow<List<OvertimeRequest>> = _pendingRequests.asStateFlow()

    private val _employees = MutableStateFlow(MockData.employees)
    val employees: StateFlow<List<Employee>> = _employees.asStateFlow()

    fun approveRequest(requestId: Int) {
        _pendingRequests.update { list ->
            list.filter { it.id != requestId }
        }
    }

    fun rejectRequest(requestId: Int) {
        _pendingRequests.update { list ->
            list.filter { it.id != requestId }
        }
    }

    fun getRequestById(id: Int): OvertimeRequest? {
        return MockData.initialPendingRequests.find { it.id == id }
    }
}
