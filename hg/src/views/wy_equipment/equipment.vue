<template>
  <basic-container>
    <avue-crud :option="option"
               :table-loading="loading"
               :data="data"
               :page.sync="page"
               :permission="permissionList"
               :before-open="beforeOpen"
               v-model="form"
               ref="crud"
               @row-update="rowUpdate"
               @row-save="rowSave"
               @row-del="rowDel"
               @search-change="searchChange"
               @search-reset="searchReset"
               @selection-change="selectionChange"
               @current-change="currentChange"
               @size-change="sizeChange"
               @refresh-change="refreshChange"
               @on-load="onLoad">
      <template slot="menuLeft">
        <el-button type="danger"
                   size="small"
                   icon="el-icon-delete"
                   plain
                   v-if="permission.equipment_delete"
                   @click="handleDelete">删 除
        </el-button>
      </template>
      <template slot-scope="scope" slot="menu">
        <el-button
          type="text"
          size="small"
          @click.stop="jh(scope.row)"
        >激活设备
        </el-button>
        <el-button
        type="text"
        size="small"
        @click.stop="cxjh(scope.row)"
      >重新激活
      </el-button>
      </template>
    </avue-crud>

    <el-dialog
      title="激活设备"
      :visible.sync="jhShow"
      width="50%"
      append-to-body
      @close="() => { this.$refs['jhForm'].resetFields() }">
      <el-form ref="jhForm" :model="jhForm" :rules="jhRules">
        <el-row>
          <el-col :span="12">
            <el-form-item label="激活类型" label-width="120px" prop="checkType">
              <el-select v-model="jhForm.checkType" placeholder="请选择">
                <el-option
                  v-for="item in jhType"
                  :key="item.dictKey"
                  :label="item.dictValue"
                  :value="item.dictKey">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="jhForm.checkType === 1">
            <el-form-item label="剩余次数" label-width="120px" prop="surplusFrequency">
              <el-input v-model="jhForm.surplusFrequency" size="small" type="number" min="1"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="jhForm.checkType === 2">
            <el-form-item label="生效日期" label-width="120px" prop="effectTime">
              <el-date-picker
                v-model="jhForm.effectTime"
                align="right"
                type="datetime"
                placeholder="选择日期"
                :picker-options="pickerOptions">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="jhForm.checkType === 2">
            <el-form-item label="失效日期" label-width="120px" prop="invalidTime">
              <el-date-picker
                v-model="jhForm.invalidTime"
                align="right"
                type="datetime"
                placeholder="选择日期"
                :picker-options="pickerOptions">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门" label-width="120px" prop="orgId">
              <avue-input-tree v-model="jhForm.orgId" placeholder="请选择部门" type="tree" :filter="false" :props="treeProps" :dic="depts"></avue-input-tree>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="jhShow = false">取 消</el-button>
    <el-button type="primary" @click="subJh('jhForm')">确 定</el-button>
  </span>
    </el-dialog>
  </basic-container>
</template>

<script>
  import {getList, getDetail, add, update, remove, jhsb, cxjhsb} from "@/api/wy_equipment/equipment";
  import {mapGetters} from "vuex";

  import { getList as getDepts } from '@/api/system/dept'

  export default {
    data() {
      return {
        jhTypes: 0,
        jhShow: false,
        jhForm: {
          checkType: '',
          effectTime: '',
          eqId: '',
          invalidTime: '',
          orgId: '',
          surplusFrequency: ''
        },
        jhType: [
          {
            dictValue: '次数',
            dictKey: 1
          },
          {
            dictValue: '时间',
            dictKey: 2
          },
          {
            dictValue: '无限制',
            dictKey: 3
          }
        ],
        treeProps: {
          label: 'deptName',
          value: 'id'
        },
        pickerOptions: {
          disabledDate(time) {
            return time.getTime() > Date.now();
          },
          shortcuts: [{
            text: '今天',
            onClick(picker) {
              picker.$emit('pick', new Date());
            }
          }, {
            text: '明天',
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() + 3600 * 1000 * 24);
              picker.$emit('pick', date);
            }
          }, {
            text: '一周后',
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() + 3600 * 1000 * 24 * 7);
              picker.$emit('pick', date);
            }
          }]
        },
        depts: [],
        jhRules: {
          checkType: [
            { required: true, message: '请选择激活类型', trigger: 'change' }
          ],
          surplusFrequency: [
            { required: true, message: '请输入剩余次数', trigger: 'change' }
          ],
          effectTime: [
            { required: true, message: '请选择生效时间', trigger: 'change' }
          ],
          invalidTime: [
            { required: true, message: '请选择失效时间', trigger: 'change' }
          ]
        },
        form: {},
        query: {},
        loading: true,
        page: {
          pageSize: 10,
          currentPage: 1,
          total: 0
        },
        selectionList: [],
        option: {
          height:'auto',
          calcHeight: 30,
          tip: false,
          searchShow: true,
          searchMenuSpan: 6,
          border: true,
          index: true,
          viewBtn: true,
          addBtn: false,
          editBtn: false,
          selection: true,
          dialogClickModal: false,
          column: [
            {
              label: "设备标识",
              prop: "equipmentCode",
              rules: [{
                required: true,
                message: "请输入设备标识",
                trigger: "blur"
              }]
            },
            {
              label: "设备名称",
              prop: "equipmentName",
              rules: [{
                required: true,
                message: "请输入设备名称",
                trigger: "blur"
              }]
            },
            {
              label: "注册时间",
              prop: "registerTime",
              rules: [{
                required: true,
                message: "请输入注册时间",
                trigger: "blur"
              }]
            },
            {
              label: "设备状态",
              prop: "equipmentStatus",
              rules: [{
                required: true,
                message: "请输入设备状态",
                trigger: "blur"
              }]
            },
            {
              label: "所属部门",
              prop: "orgId",
              rules: [{
                required: true,
                message: "请输入所属部门",
                trigger: "blur"
              }]
            },
            {
              label: "应用标识",
              prop: "applicationCode",
              rules: [{
                required: true,
                message: "请输入应用标识",
                trigger: "blur"
              }]
            },
            {
              label: "备注",
              prop: "dataRemake",
              rules: [{
                required: true,
                message: "请输入备注",
                trigger: "blur"
              }]
            },
          ]
        },
        data: []
      };
    },
    created() {
      getDepts(1, 1000).then(res => {
        this.depts = res.data.data
      })
    },
    computed: {
      ...mapGetters(["permission"]),
      permissionList() {
        return {
          addBtn: this.vaildData(this.permission.equipment_add, false),
          viewBtn: this.vaildData(this.permission.equipment_view, false),
          delBtn: this.vaildData(this.permission.equipment_delete, false),
          editBtn: this.vaildData(this.permission.equipment_edit, false)
        };
      },
      ids() {
        let ids = [];
        this.selectionList.forEach(ele => {
          ids.push(ele.id);
        });
        return ids.join(",");
      }
    },
    watch: {
      'jhForm.checkType'() {
        this.jhForm.effectTime = ''
        this.jhForm.invalidTime = ''
        this.jhForm.surplusFrequency = ''
      }
    },
    methods: {
      // 激活设备
      jh(row) {
        this.jhTypes = 1
        this.jhForm.eqId = row.id
        this.jhShow = true
      },
      subJh(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            if (this.jhTypes === 1) {
              jhsb(this.jhForm).then(res => {
                if (res.data.code === 200) {
                  this.$message.success('激活成功')
                  this.onLoad()
                  this.jhShow = false
                }
              })
            } else if (this.jhTypes === 2) {
              cxjhsb(this.jhForm).then(res => {
                if (res.data.code === 200) {
                  this.$message.success('重新激活成功')
                  this.onLoad()
                  this.jhShow = false
                }
              })
            }
          }
        })
      },
      // 重新激活
      cxjh(row) {
        this.jhTypes = 2
        this.jhForm.eqId = row.id
        this.jhShow = true
      },
      rowSave(row, done, loading) {
        add(row).then(() => {
          this.onLoad(this.page);
          this.$message({
            type: "success",
            message: "操作成功!"
          });
          done();
        }, error => {
          loading();
          window.console.log(error);
        });
      },
      rowUpdate(row, index, done, loading) {
        update(row).then(() => {
          this.onLoad(this.page);
          this.$message({
            type: "success",
            message: "操作成功!"
          });
          done();
        }, error => {
          loading();
          console.log(error);
        });
      },
      rowDel(row) {
        this.$confirm("确定将选择数据删除?", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            return remove(row.id);
          })
          .then(() => {
            this.onLoad(this.page);
            this.$message({
              type: "success",
              message: "操作成功!"
            });
          });
      },
      handleDelete() {
        if (this.selectionList.length === 0) {
          this.$message.warning("请选择至少一条数据");
          return;
        }
        this.$confirm("确定将选择数据删除?", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            return remove(this.ids);
          })
          .then(() => {
            this.onLoad(this.page);
            this.$message({
              type: "success",
              message: "操作成功!"
            });
            this.$refs.crud.toggleSelection();
          });
      },
      beforeOpen(done, type) {
        if (["edit", "view"].includes(type)) {
          getDetail(this.form.id).then(res => {
            this.form = res.data.data;
          });
        }
        done();
      },
      searchReset() {
        this.query = {};
        this.onLoad(this.page);
      },
      searchChange(params, done) {
        this.query = params;
        this.page.currentPage = 1;
        this.onLoad(this.page, params);
        done();
      },
      selectionChange(list) {
        this.selectionList = list;
      },
      selectionClear() {
        this.selectionList = [];
        this.$refs.crud.toggleSelection();
      },
      currentChange(currentPage){
        this.page.currentPage = currentPage;
      },
      sizeChange(pageSize){
        this.page.pageSize = pageSize;
      },
      refreshChange() {
        this.onLoad(this.page, this.query);
      },
      onLoad(page, params = {}) {
        this.loading = true;
        getList(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
          const data = res.data.data;
          this.page.total = data.total;
          this.data = data.records;
          this.loading = false;
          this.selectionClear();
        });
      }
    }
  };
</script>

<style>
</style>
