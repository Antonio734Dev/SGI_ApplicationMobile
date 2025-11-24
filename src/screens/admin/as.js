import React, { useEffect, useState, useMemo, useRef } from 'react'
import { Text, View, Platform, TouchableOpacity, Dimensions, KeyboardAvoidingView } from 'react-native'
import ScrollableLayout from '../../layouts/ScrollableLayout'
// Se elimina Modalize, usamos Dialog
import { Accordion, Button, ScrollShadow, Spinner, Switch, TextField, useTheme, Select, Dialog } from 'heroui-native'
import { getUsersRequest, updateUser, changeStatus, createUser } from '../../services/user'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { formatDateLiteral } from '../../utils/utils'

// =====================================================================
// CONSTANTES Y UTILIDADES DE ROLES
// =====================================================================
const ROLE_OPTIONS = [
    { value: '1', label: 'Administrador' },
    { value: '2', label: 'Supervisor' },
    { value: '3', label: 'Operador' },
]

const getRoleLabel = (id) => {
    const role = ROLE_OPTIONS.find((r) => r.value == id)
    return role ? role.label : 'Seleccionar Rol'
}

// =====================================================================
// SUB-COMPONENTE: DIALOG DE EDICIÓN POR USUARIO
// =====================================================================
const EditUserDialog = ({ user, onUserUpdated }) => {
    const { colors } = useTheme()
    const [isOpen, setIsOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [editedUser, setEditedUser] = useState({ ...user })

    // Resetear datos cuando se abre
    useEffect(() => {
        if (isOpen) setEditedUser({ ...user })
    }, [isOpen, user])

    const handleSave = async () => {
        if (!editedUser.name.trim() || !editedUser.email.trim() || !editedUser.position.trim()) {
            alert('Campos obligatorios faltantes')
            return
        }
        try {
            setIsSaving(true)
            const userToUpdate = {
                id: editedUser.id,
                name: editedUser.name.trim(),
                email: editedUser.email.trim(),
                position: editedUser.position.trim(),
                phone: editedUser.phone?.trim() || '',
                roleId: editedUser.roleId,
            }
            const response = await updateUser(userToUpdate)
            if (response.type === 'SUCCESS') {
                alert(`Usuario ${editedUser.name} actualizado correctamente`)
                setIsOpen(false)
                if (onUserUpdated) onUserUpdated()
            } else {
                alert('No se pudo actualizar el usuario')
            }
        } catch (error) {
            console.error('Error al actualizar usuario:', error)
            alert(error.response?.data?.message || 'Error al actualizar el usuario')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <View className="flex-1">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <Dialog.Trigger asChild>
                    <Button className="flex-1" variant="primary">
                        <Ionicons name="create-outline" size={20} color={colors.accentForeground} />
                        <Button.Label className="text-[14px]">Editar</Button.Label>
                    </Button>
                </Dialog.Trigger>

                <Dialog.Portal>
                    <Dialog.Overlay className="bg-black/30" />
                    <KeyboardAvoidingView behavior="padding">
                        <Dialog.Content className="w-full max-h-full mt-20 rounded-t-2xl rounded-b-none">
                            <View className="p-6 gap-4 w-full">
                                {/* Header */}
                                <View className="flex-row justify-between items-center mb-2">
                                    <Text className="text-foreground text-2xl font-bold">Editar Usuario</Text>
                                </View>

                                <Text className="text-muted text-[14px] -mt-3 mb-2">Modifica la información del usuario</Text>

                                {/* Formulario */}
                                <View className="gap-4">
                                    <TextField>
                                        <TextField.Label className="text-foreground font-medium mb-2">Nombre *</TextField.Label>
                                        <TextField.Input
                                            colors={{
                                                blurBackground: colors.surface2,
                                                focusBackground: colors.surface2,
                                                blurBorder: colors.surface3,
                                                focusBorder: colors.accent,
                                            }}
                                            placeholder="Nombre del usuario"
                                            value={editedUser.name}
                                            onChangeText={(text) => setEditedUser((prev) => ({ ...prev, name: text }))}
                                            cursorColor={colors.accent}
                                            selectionHandleColor={colors.accent}
                                            selectionColor={Platform.OS === 'ios' ? colors.accent : colors.muted}
                                        />
                                    </TextField>

                                    <TextField>
                                        <TextField.Label className="text-foreground font-medium mb-2">Correo Electrónico *</TextField.Label>
                                        <TextField.Input
                                            colors={{
                                                blurBackground: colors.surface2,
                                                focusBackground: colors.surface2,
                                                blurBorder: colors.surface3,
                                                focusBorder: colors.accent,
                                            }}
                                            placeholder="correo@ejemplo.com"
                                            value={editedUser.email}
                                            onChangeText={(text) => setEditedUser((prev) => ({ ...prev, email: text }))}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            cursorColor={colors.accent}
                                            selectionHandleColor={colors.accent}
                                            selectionColor={Platform.OS === 'ios' ? colors.accent : colors.muted}
                                        />
                                    </TextField>

                                    <TextField>
                                        <TextField.Label className="text-foreground font-medium mb-2">Puesto *</TextField.Label>
                                        <TextField.Input
                                            colors={{
                                                blurBackground: colors.surface2,
                                                focusBackground: colors.surface2,
                                                blurBorder: colors.surface3,
                                                focusBorder: colors.accent,
                                            }}
                                            placeholder="Puesto del usuario"
                                            value={editedUser.position}
                                            onChangeText={(text) => setEditedUser((prev) => ({ ...prev, position: text }))}
                                            cursorColor={colors.accent}
                                            selectionHandleColor={colors.accent}
                                            selectionColor={Platform.OS === 'ios' ? colors.accent : colors.muted}
                                        />
                                    </TextField>

                                    <View style={{ zIndex: 1000 }}>
                                        <Text className="text-foreground font-medium mb-2">Rol *</Text>
                                        <Select
                                            value={{ value: String(editedUser.roleId), label: getRoleLabel(editedUser.roleId) }}
                                            onValueChange={(opt) => setEditedUser({ ...editedUser, roleId: Number(opt.value) })}
                                        >
                                            <Select.Trigger>
                                                <View className="w-full h-14 flex-row items-center justify-between px-4 rounded-xl bg-surface-2 border border-surface-3">
                                                    <Text className="text-foreground font-medium">{getRoleLabel(editedUser.roleId)}</Text>
                                                    <Ionicons name="chevron-down" size={20} color={colors.muted} />
                                                </View>
                                            </Select.Trigger>
                                            <Select.Portal>
                                                <Select.Overlay className="bg-black/30" />
                                                <Select.Content presentation="modal" className="bg-surface-1 rounded-t-2xl">
                                                    {ROLE_OPTIONS.map((role) => (
                                                        <Select.Item
                                                            key={role.value}
                                                            value={role.value}
                                                            label={role.label}
                                                            className="p-4 border-b border-surface-2"
                                                        >
                                                            <View className="flex-row justify-between items-center w-full">
                                                                <Text className="text-foreground text-lg">{role.label}</Text>
                                                                {String(editedUser.roleId) === role.value && (
                                                                    <Ionicons name="checkmark" size={20} color={colors.accent} />
                                                                )}
                                                            </View>
                                                        </Select.Item>
                                                    ))}
                                                </Select.Content>
                                            </Select.Portal>
                                        </Select>
                                    </View>

                                    <TextField>
                                        <TextField.Label className="text-foreground font-medium mb-2">Teléfono</TextField.Label>
                                        <TextField.Input
                                            colors={{
                                                blurBackground: colors.surface2,
                                                focusBackground: colors.surface2,
                                                blurBorder: colors.surface3,
                                                focusBorder: colors.accent,
                                            }}
                                            placeholder="Teléfono del usuario"
                                            value={editedUser.phone}
                                            onChangeText={(text) => setEditedUser((prev) => ({ ...prev, phone: text }))}
                                            keyboardType="phone-pad"
                                            cursorColor={colors.accent}
                                            selectionHandleColor={colors.accent}
                                            selectionColor={Platform.OS === 'ios' ? colors.accent : colors.muted}
                                        />
                                    </TextField>
                                </View>

                                {/* Botones de acción */}
                                <View className="flex-row justify-end gap-3 pt-6">
                                    <Dialog.Close className="flex-1">
                                        <Button className="flex-1 bg-surface-2" isDisabled={isSaving}>
                                            <Button.Label className="text-foreground">Cancelar</Button.Label>
                                        </Button>
                                    </Dialog.Close>
                                    <Button
                                        className="flex-1"
                                        variant="primary"
                                        onPress={handleSave}
                                        isDisabled={isSaving || !editedUser.name.trim() || !editedUser.email.trim() || !editedUser.position.trim()}
                                    >
                                        {isSaving ? (
                                            <Spinner size="sm" color={colors.accentForeground} />
                                        ) : (
                                            <>
                                                <Ionicons name="checkmark" size={20} color={colors.accentForeground} />
                                                <Button.Label>Guardar</Button.Label>
                                            </>
                                        )}
                                    </Button>
                                </View>
                            </View>
                        </Dialog.Content>
                    </KeyboardAvoidingView>
                </Dialog.Portal>
            </Dialog>
        </View>
    )
}

// =====================================================================
// SUB-COMPONENTE: DIALOG DE CREACIÓN
// =====================================================================
const CreateUserDialog = ({ onUserCreated, isLoading }) => {
    const { colors } = useTheme()
    const [isOpen, setIsOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [newUser, setNewUser] = useState({ name: '', email: '', position: '', phone: '', roleId: 3 })

    const handleCreate = async () => {
        if (!newUser.name.trim() || !newUser.email.trim() || !newUser.position.trim()) {
            alert('Campos obligatorios faltantes')
            return
        }
        try {
            setIsSaving(true)
            await createUser(newUser)
            alert('Usuario creado correctamente')
            setNewUser({ name: '', email: '', position: '', phone: '', roleId: 3 })
            setIsOpen(false)
            if (onUserCreated) onUserCreated()
        } catch (error) {
            alert('No se pudo crear el usuario')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <View>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <Dialog.Trigger asChild>
                    <Button isIconOnly className="font-semibold shrink-0" variant="primary" isDisabled={isLoading}>
                        <Ionicons name="add-outline" size={24} color={colors.accentForeground} />
                    </Button>
                </Dialog.Trigger>

                <Dialog.Portal>
                    <Dialog.Overlay className="bg-black/30" />
                    <Dialog.Content className="bg-surface-1 rounded-2xl w-[90%] max-w-[500px] self-center">
                        <View className="p-6 gap-4 w-full">
                            {/* Header */}
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-foreground text-2xl font-bold">Nuevo Usuario</Text>
                            </View>

                            <Text className="text-muted text-[14px] -mt-3 mb-2">Ingrese los datos del nuevo usuario</Text>

                            {/* Formulario */}
                            <View className="gap-4">
                                <TextField>
                                    <TextField.Label className="text-foreground font-medium mb-2">Nombre *</TextField.Label>
                                    <TextField.Input
                                        colors={{
                                            blurBackground: colors.surface2,
                                            focusBackground: colors.surface2,
                                            blurBorder: colors.surface3,
                                            focusBorder: colors.accent,
                                        }}
                                        placeholder="Nombre del usuario"
                                        value={newUser.name}
                                        onChangeText={(text) => setNewUser((prev) => ({ ...prev, name: text }))}
                                        cursorColor={colors.accent}
                                        selectionHandleColor={colors.accent}
                                        selectionColor={Platform.OS === 'ios' ? colors.accent : colors.muted}
                                    />
                                </TextField>

                                <TextField>
                                    <TextField.Label className="text-foreground font-medium mb-2">Correo Electrónico *</TextField.Label>
                                    <TextField.Input
                                        colors={{
                                            blurBackground: colors.surface2,
                                            focusBackground: colors.surface2,
                                            blurBorder: colors.surface3,
                                            focusBorder: colors.accent,
                                        }}
                                        placeholder="correo@ejemplo.com"
                                        value={newUser.email}
                                        onChangeText={(text) => setNewUser((prev) => ({ ...prev, email: text }))}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        cursorColor={colors.accent}
                                        selectionHandleColor={colors.accent}
                                        selectionColor={Platform.OS === 'ios' ? colors.accent : colors.muted}
                                    />
                                </TextField>

                                <TextField>
                                    <TextField.Label className="text-foreground font-medium mb-2">Puesto *</TextField.Label>
                                    <TextField.Input
                                        colors={{
                                            blurBackground: colors.surface2,
                                            focusBackground: colors.surface2,
                                            blurBorder: colors.surface3,
                                            focusBorder: colors.accent,
                                        }}
                                        placeholder="Puesto del usuario"
                                        value={newUser.position}
                                        onChangeText={(text) => setNewUser((prev) => ({ ...prev, position: text }))}
                                        cursorColor={colors.accent}
                                        selectionHandleColor={colors.accent}
                                        selectionColor={Platform.OS === 'ios' ? colors.accent : colors.muted}
                                    />
                                </TextField>

                                <View style={{ zIndex: 1000 }}>
                                    <Text className="text-foreground font-medium mb-2">Rol *</Text>
                                    <Select
                                        value={{ value: String(newUser.roleId), label: getRoleLabel(newUser.roleId) }}
                                        onValueChange={(opt) => setNewUser({ ...newUser, roleId: Number(opt.value) })}
                                    >
                                        <Select.Trigger>
                                            <View className="w-full h-14 flex-row items-center justify-between px-4 rounded-xl bg-surface-2 border border-surface-3">
                                                <Text className="text-foreground font-medium">{getRoleLabel(newUser.roleId)}</Text>
                                                <Ionicons name="chevron-down" size={20} color={colors.muted} />
                                            </View>
                                        </Select.Trigger>
                                        <Select.Portal>
                                            <Select.Overlay className="bg-black/50" />
                                            <Select.Content presentation="modal" className="bg-surface-1 rounded-t-2xl">
                                                {ROLE_OPTIONS.map((role) => (
                                                    <Select.Item
                                                        key={role.value}
                                                        value={role.value}
                                                        label={role.label}
                                                        className="p-4 border-b border-surface-2"
                                                    >
                                                        <View className="flex-row justify-between items-center w-full">
                                                            <Text className="text-foreground text-lg">{role.label}</Text>
                                                            {String(newUser.roleId) === role.value && (
                                                                <Ionicons name="checkmark" size={20} color={colors.accent} />
                                                            )}
                                                        </View>
                                                    </Select.Item>
                                                ))}
                                            </Select.Content>
                                        </Select.Portal>
                                    </Select>
                                </View>

                                <TextField>
                                    <TextField.Label className="text-foreground font-medium mb-2">Teléfono</TextField.Label>
                                    <TextField.Input
                                        colors={{
                                            blurBackground: colors.surface2,
                                            focusBackground: colors.surface2,
                                            blurBorder: colors.surface3,
                                            focusBorder: colors.accent,
                                        }}
                                        placeholder="Teléfono (Opcional)"
                                        value={newUser.phone}
                                        onChangeText={(text) => setNewUser((prev) => ({ ...prev, phone: text }))}
                                        keyboardType="phone-pad"
                                        cursorColor={colors.accent}
                                        selectionHandleColor={colors.accent}
                                        selectionColor={Platform.OS === 'ios' ? colors.accent : colors.muted}
                                    />
                                </TextField>
                            </View>

                            {/* Botones de acción */}
                            <View className="flex-row justify-end gap-3 pt-6">
                                <Dialog.Close className="flex-1">
                                    <Button className="flex-1 bg-surface-2" isDisabled={isSaving}>
                                        <Button.Label className="text-foreground">Cancelar</Button.Label>
                                    </Button>
                                </Dialog.Close>
                                <Button
                                    className="flex-1"
                                    variant="primary"
                                    onPress={handleCreate}
                                    isDisabled={isSaving || !newUser.name.trim() || !newUser.email.trim() || !newUser.position.trim()}
                                >
                                    {isSaving ? (
                                        <Spinner size="sm" color={colors.accentForeground} />
                                    ) : (
                                        <>
                                            <Ionicons name="add" size={20} color={colors.accentForeground} />
                                            <Button.Label>Crear</Button.Label>
                                        </>
                                    )}
                                </Button>
                            </View>
                        </View>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog>
        </View>
    )
}
// =====================================================================
// COMPONENTE: STATUS CHANGE DIALOG (CON SWITCH INTEGRADO)
// =====================================================================
const StatusChangeDialog = ({ user, onStatusChanged }) => {
    const { colors } = useTheme()
    const [isOpen, setIsOpen] = useState(false)
    const [isChangingStatus, setIsChangingStatus] = useState(false)

    const handleChangeStatus = async () => {
        try {
            setIsChangingStatus(true)
            const response = await changeStatus(user.email)
            if (response.type === 'SUCCESS') {
                if (onStatusChanged) onStatusChanged()
                setIsOpen(false) // Cerramos el dialog manualmente tras éxito
            } else {
                alert('No se pudo cambiar el estado')
            }
        } catch (error) {
            alert('Error al cambiar estado')
        } finally {
            setIsChangingStatus(false)
        }
    }

    return (
        <View>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                {/* TRIGGER: El Switch envuelto para capturar el press */}
                <Dialog.Trigger asChild>
                    <TouchableOpacity activeOpacity={0.8}>
                        {/* pointerEvents="none" hace que el Switch sea solo visual y el toque lo reciba el TouchableOpacity (el Trigger) */}
                        <View pointerEvents="none">
                            <Switch
                                isSelected={user.status === 'activo'}
                                trackColor={{ false: colors.surface3, true: colors.accent }}
                                colors={{
                                    defaultBackground: colors.surface3,
                                    selectedBackground: colors.accent,
                                }}
                                // props visuales del thumb
                                thumbColor={colors.accentForeground}
                            />
                            <Switch
                                isSelected={item.status === 'activo'}
                                colors={{
                                    defaultBackground: colors.surface2,
                                    selectedBackground: colors.accent,
                                    defaultBorder: 'transparent',
                                    selectedBorder: 'transparent',
                                }}
                            >
                                <Switch.Thumb
                                    colors={{
                                        defaultBackground: colors.background,
                                        selectedBackground: colors.accentForeground,
                                    }}
                                />
                            </Switch>
                        </View>
                    </TouchableOpacity>
                </Dialog.Trigger>

                <Dialog.Portal>
                    <Dialog.Overlay className="bg-black/30" />
                    <Dialog.Content className="bg-surface-1 rounded-2xl w-[90%] max-w-[400px] self-center p-6">
                        <View className="gap-4">
                            <View className="gap-2">
                                <Text className="text-foreground text-xl font-bold text-center">
                                    {user.status === 'activo' ? '¿Inhabilitar usuario?' : '¿Habilitar usuario?'}
                                </Text>
                                <Text className="text-muted text-center text-sm">
                                    {user.status === 'activo'
                                        ? `¿Está seguro que desea inhabilitar a ${user.name}? El usuario no podrá acceder al sistema.`
                                        : `¿Está seguro que desea habilitar a ${user.name}? El usuario podrá acceder al sistema nuevamente.`}
                                </Text>
                            </View>

                            <View className="flex-row gap-3 mt-2">
                                {/* BOTÓN CANCELAR: Envuelto en Dialog.Close para que funcione */}
                                <Dialog.Close asChild>
                                    <Button className="flex-1 bg-surface-2" isDisabled={isChangingStatus}>
                                        <Button.Label className="text-foreground">Cancelar</Button.Label>
                                    </Button>
                                </Dialog.Close>

                                <Button className="flex-1" variant="primary" onPress={handleChangeStatus} isDisabled={isChangingStatus}>
                                    {isChangingStatus ? (
                                        <Spinner size="sm" color={colors.accentForeground} />
                                    ) : (
                                        <>
                                            <Ionicons
                                                name={user.status === 'activo' ? 'close-circle-outline' : 'checkmark-circle-outline'}
                                                size={20}
                                                color={colors.accentForeground}
                                            />
                                            <Button.Label>{user.status === 'activo' ? 'Inhabilitar' : 'Habilitar'}</Button.Label>
                                        </>
                                    )}
                                </Button>
                            </View>
                        </View>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog>
        </View>
    )
}
// =====================================================================
// PANTALLA PRINCIPAL
// =====================================================================
const UsersScreen = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [users, setUsers] = useState([])
    const { colors } = useTheme()

    // Estados de lógica
    const [searchValue, setSearchValue] = useState('')
    const [sortOption, setSortOption] = useState({ value: 'name', label: 'Nombre' })
    const [statusFilter, setStatusFilter] = useState('all')
    const [rowsPerPage, setRowsPerPage] = useState('10')
    const [page, setPage] = useState(1)

    const dummyUnifiedValue = { value: 'unified', label: 'Filtros' }
    const unifiedOptions = [
        { type: 'header', label: 'ORDENAR POR' },
        { value: 'sort-name', label: 'Nombre', raw: 'name', group: 'sort' },
        { value: 'sort-email', label: 'Correo', raw: 'email', group: 'sort' },
        { value: 'sort-role', label: 'Rol', raw: 'role', group: 'sort' },
        { type: 'header', label: 'FILTRAR POR ESTATUS' },
        { value: 'status-all', label: 'Todos los estatus', raw: 'all', group: 'status' },
        { value: 'status-activo', label: 'Activo', raw: 'activo', group: 'status' },
        { value: 'status-inactivo', label: 'Inactivo', raw: 'inactivo', group: 'status' },
        { type: 'header', label: 'FILAS POR PÁGINA' },
        { value: 'rows-1', label: '1 fila', raw: '1', group: 'rows' },
        { value: 'rows-5', label: '5 filas', raw: '5', group: 'rows' },
        { value: 'rows-10', label: '10 filas', raw: '10', group: 'rows' },
        { value: 'rows-20', label: '20 filas', raw: '20', group: 'rows' },
        { value: 'rows-50', label: '50 filas', raw: '50', group: 'rows' },
    ]

    const handleUnifiedChange = (selectedItem) => {
        const val = selectedItem?.value || selectedItem
        if (!val || typeof val !== 'string' || val === 'unified') return

        const opt = unifiedOptions.find((o) => o.value === val)
        if (!opt || opt.type === 'header') return

        if (opt.group === 'sort') setSortOption({ value: opt.raw, label: opt.label })
        else if (opt.group === 'status') setStatusFilter(opt.raw)
        else if (opt.group === 'rows') {
            setRowsPerPage(opt.raw)
            setPage(1)
        }
    }

    const fetchData = async () => {
        try {
            setIsLoading(true)
            const response = await getUsersRequest()
            if (response?.data) {
                const dataCount = response.data.map((item) => ({
                    ...item,
                    role: item.roleId === 1 ? 'Administrador' : item.roleId === 2 ? 'Supervisor' : 'Operador',
                    status: item.status ? 'activo' : 'inactivo',
                }))
                setUsers(dataCount)
            }
        } catch (err) {
            console.error('Error fetch:', err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        setPage(1)
    }, [searchValue, statusFilter, rowsPerPage])

    const filteredAndSortedItems = useMemo(() => {
        let result = [...users]

        if (searchValue) {
            const lowerSearch = searchValue.toLowerCase()
            result = result.filter((user) => user.name.toLowerCase().includes(lowerSearch) || user.email.toLowerCase().includes(lowerSearch))
        }

        if (statusFilter && statusFilter !== 'all') {
            result = result.filter((user) => user.status === statusFilter)
        }

        if (sortOption?.value) {
            const key = sortOption.value
            const keyString = (user) => (user[key] || '').toString().toLowerCase()
            result.sort((a, b) => keyString(a).localeCompare(keyString(b)))
        }

        return result
    }, [users, searchValue, statusFilter, sortOption])

    const pages = Math.ceil(filteredAndSortedItems.length / Number(rowsPerPage))

    const paginatedItems = useMemo(() => {
        const start = (page - 1) * Number(rowsPerPage)
        return filteredAndSortedItems.slice(start, start + Number(rowsPerPage))
    }, [page, filteredAndSortedItems, rowsPerPage])

    return (
        <View style={{ flex: 1 }}>
            <ScrollableLayout onRefresh={fetchData}>
                <View className="px-[6%] py-[0%] min-h-full pb-10">
                    <View className="flex flex-col w-full justify-between shrink-0 gap-4 items-end">
                        <View className="w-full flex flex-row justify-between items-end">
                            <Text className="font-bold text-[32px] text-foreground">Usuarios</Text>
                            <View className="flex flex-row gap-2 items-center">
                                <Select value={dummyUnifiedValue} onValueChange={handleUnifiedChange}>
                                    <Select.Trigger asChild>
                                        <Button isIconOnly className="bg-transparent">
                                            <Ionicons name="filter-outline" size={24} color={colors.foreground} />
                                        </Button>
                                    </Select.Trigger>
                                    <Select.Portal>
                                        <Select.Overlay className="bg-black/20" />
                                        <Select.Content presentation="bottom-sheet">
                                            <Select.Item key="unified" value="unified" label="Filtros" className="hidden h-0 p-0" />
                                            {unifiedOptions.map((opt, index) => {
                                                if (opt.type === 'header') {
                                                    return (
                                                        <View key={`header-${index}`} className="pt-4 px-2">
                                                            <Text className="text-[12px] font-bold text-neutral-500 tracking-widest uppercase">
                                                                {opt.label}
                                                            </Text>
                                                        </View>
                                                    )
                                                }
                                                let isSelected = false
                                                if (opt.group === 'sort') isSelected = sortOption.value === opt.raw
                                                else if (opt.group === 'status') isSelected = statusFilter === opt.raw
                                                else if (opt.group === 'rows') isSelected = rowsPerPage === opt.raw

                                                return (
                                                    <Select.Item key={opt.value} value={opt.value} label={opt.label}>
                                                        <View className="flex-row items-center justify-between flex-1">
                                                            <Text className={`text-base text-foreground ${isSelected ? 'font-bold' : ''}`}>{opt.label}</Text>
                                                            {isSelected && <Ionicons name="checkmark" size={24} color={colors.accent} />}
                                                        </View>
                                                    </Select.Item>
                                                )
                                            })}
                                        </Select.Content>
                                    </Select.Portal>
                                </Select>
                                <CreateUserDialog onUserCreated={fetchData} isLoading={isLoading} />
                            </View>
                        </View>
                    </View>

                    <View className="mb-4 mt-4 flex-row justify-between items-start">
                        <Text className="text-[14px] font-semibold text-muted">{filteredAndSortedItems.length} Resultados</Text>
                        <View className="flex flex-row gap-2">
                            <View className="flex-row items-center bg-surface-1 px-2 py-2 rounded-full gap-1">
                                <Ionicons name="swap-vertical" size={12} color={colors.foreground} />
                                <Text className="text-xs font-semibold text-foreground">{sortOption.label}</Text>
                            </View>
                            {statusFilter !== 'all' && (
                                <View className="flex-row items-center bg-surface-1 px-2 py-2 rounded-lg gap-2">
                                    <View className="w-2 h-2 rounded-full bg-accent" />
                                    <Text className="text-xs font-semibold text-foreground capitalize">{statusFilter}</Text>
                                </View>
                            )}
                            <View className="flex-row items-center bg-surface-1 px-2 py-2 rounded-lg">
                                <Text className="text-xs font-semibold text-foreground">{rowsPerPage} / Pág</Text>
                            </View>
                        </View>
                    </View>

                    <TextField>
                        <TextField.Input
                            colors={{
                                blurBackground: colors.accentSoft,
                                focusBackground: colors.surface2,
                                blurBorder: colors.accentSoft,
                                focusBorder: colors.surface2,
                            }}
                            className="mb-4"
                            placeholder="Buscar..."
                            autoCapitalize="none"
                            cursorColor={colors.accent}
                            selectionHandleColor={colors.accent}
                            selectionColor={Platform.OS === 'ios' ? colors.accent : colors.muted}
                            value={searchValue}
                            onChangeText={setSearchValue}
                        />
                    </TextField>

                    {isLoading ? (
                        <View className="py-12 items-center">
                            <Spinner color={colors.foreground} size="md" />
                        </View>
                    ) : (
                        <ScrollShadow className="w-full" size={20} LinearGradientComponent={LinearGradient}>
                            <View className="p-0">
                                {paginatedItems.length > 0 ? (
                                    <>
                                        <Accordion selectionMode="single" className="border-0" isDividerVisible={false}>
                                            {paginatedItems.map((item) => (
                                                <Accordion.Item key={item.id} value={item.id} className="bg-accent-soft mb-2 rounded-lg overflow-hidden">
                                                    <Accordion.Trigger className="w-full bg-accent-soft px-4 py-4">
                                                        <View className="flex-row items-center gap-2 w-full">
                                                            <View className="flex-1 gap-2">
                                                                <View className="flex-row items-center gap-2">
                                                                    <View
                                                                        className={`w-2 h-2 rounded-full ${item.status === 'activo' ? 'bg-accent' : 'bg-surface-3'}`}
                                                                    />
                                                                    <Text className="text-foreground flex-shrink text-lg font-semibold" numberOfLines={1}>
                                                                        {item.name}
                                                                    </Text>
                                                                </View>
                                                                <Text className="text-foreground" numberOfLines={1}>
                                                                    {item.email}
                                                                </Text>
                                                            </View>
                                                            <Accordion.Indicator />
                                                        </View>
                                                    </Accordion.Trigger>
                                                    <Accordion.Content className="bg-accent-soft px-4 pb-4">
                                                        <View className="h-px bg-surface-3 mt-2 mb-4" />
                                                        <View className="gap-4">
                                                            <View className="gap-2">
                                                                <View className="flex-row">
                                                                    <Text className="text-[14px] text-muted font-medium w-24">Actualizado</Text>
                                                                    <Text className="text-[14px] text-foreground text-right flex-1" numberOfLines={2}>
                                                                        {formatDateLiteral(item.updatedAt, true)}
                                                                    </Text>
                                                                </View>
                                                                <View className="flex-row">
                                                                    <Text className="text-[14px] text-muted font-medium w-24">Puesto</Text>
                                                                    <Text className="text-[14px] text-foreground text-right flex-1" numberOfLines={2}>
                                                                        {item.position}
                                                                    </Text>
                                                                </View>
                                                                <View className="flex-row">
                                                                    <Text className="text-[14px] text-muted font-medium w-24">Rol</Text>
                                                                    <Text className="text-[14px] text-foreground text-right flex-1" numberOfLines={2}>
                                                                        {item.role}
                                                                    </Text>
                                                                </View>
                                                                <View className="flex-row items-center">
                                                                    <Text className="text-[14px] text-muted font-medium w-24">Teléfono</Text>
                                                                    <Text className="text-[14px] text-foreground text-right flex-1" numberOfLines={2}>
                                                                        {item.phone || 'No especificado'}
                                                                    </Text>
                                                                </View>
                                                                <View className="flex-row items-center justify-between">
                                                                    {/* Ajuste de altura para alinear */}
                                                                    <Text className="text-[14px] text-muted font-medium w-24">Estado</Text>
                                                                    {/* AQUÍ VA EL NUEVO COMPONENTE INTEGRADO */}
                                                                    <StatusChangeDialog user={item} onStatusChanged={fetchData} />
                                                                </View>
                                                            </View>
                                                            <View className="flex-row gap-3 mt-2">
                                                                <EditUserDialog user={item} onUserUpdated={fetchData} />
                                                            </View>
                                                        </View>
                                                    </Accordion.Content>
                                                </Accordion.Item>
                                            ))}
                                        </Accordion>
                                        <View className="items-center mt-8 mb-4">
                                            <View className="flex-row items-center bg-foreground/90 px-2 h-14 py-1.5 rounded-lg shadow-lg gap-4">
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="light"
                                                    className="w-8 h-8 rounded-full bg-transparent"
                                                    isDisabled={page === 1}
                                                    onPress={() => setPage((p) => Math.max(1, p - 1))}
                                                >
                                                    <Ionicons name="chevron-back" size={18} color={page === 1 ? colors.muted : colors.background} />
                                                </Button>
                                                <Text className="text-background font-bold text-sm px-2">
                                                    {page} <Text className="text-base ">/ {pages || 1}</Text>
                                                </Text>
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="light"
                                                    className="w-8 h-8 rounded-full bg-transparent"
                                                    isDisabled={page === pages || pages === 0}
                                                    onPress={() => setPage((p) => Math.min(pages, p + 1))}
                                                >
                                                    <Ionicons
                                                        name="chevron-forward"
                                                        size={18}
                                                        color={page === pages || pages === 0 ? colors.muted : colors.background}
                                                    />
                                                </Button>
                                            </View>
                                        </View>
                                    </>
                                ) : (
                                    <Text className="text-center mt-4 text-neutral-500">No se encontraron usuarios.</Text>
                                )}
                            </View>
                        </ScrollShadow>
                    )}
                </View>
            </ScrollableLayout>
        </View>
    )
}

export default UsersScreen
