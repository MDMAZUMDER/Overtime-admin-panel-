// File: app/src/main/java/com/example/overtimeadmin/ui/MainViewModel.kt
package com.example.overtimeadmin.ui

import androidx.lifecycle.ViewModel
import com.example.overtimeadmin.data.model.*
import com.example.overtimeadmin.data.repository.MockDataRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

class MainViewModel : ViewModel() {

    private val _pendingRequests = MutableStateFlow(MockDataRepository.initialPendingRequests)
    val pendingRequests: StateFlow<List<OvertimeRequest>> = _pendingRequests.asStateFlow()

    private val _employees = MutableStateFlow(MockDataRepository.employees)
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
        return MockDataRepository.initialPendingRequests.find { it.id == id }
    }
}
