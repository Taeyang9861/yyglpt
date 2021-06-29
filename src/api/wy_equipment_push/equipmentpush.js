import request from '@/router/axios';

export const getList = (current, size, params) => {
  return request({
    url: '/api/wy_equipment_push/equipmentpush/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const getDetail = (id) => {
  return request({
    url: '/api/wy_equipment_push/equipmentpush/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/wy_equipment_push/equipmentpush/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/wy_equipment_push/equipmentpush/submit',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/wy_equipment_push/equipmentpush/submit',
    method: 'post',
    data: row
  })
}

