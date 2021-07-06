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
      <!-- <template slot="menuLeft">
        <el-button type="danger"
                   size="small"
                   icon="el-icon-delete"
                   plain
                   v-if="permission.pushlog_delete"
                   @click="handleDelete">删 除
        </el-button>
      </template> -->
      <template slot="pushType" slot-scope="scope">
        <span>{{ scope.row.pushType === 1 ? '解锁消息' : (scope.row.pushType === 2 ? '锁机消息' : (scope.row.pushType === 3 ? '收款码消息' : (scope.row.pushType === 4 ? '硬锁消息(人工锁机)' : (scope.row.pushType === 5 ? '硬解锁消息(人工解除)' : (scope.row.pushType === 6 ? '激活完成提醒' : '——'))))) }}</span>
      </template>
    </avue-crud>
  </basic-container>
</template>

<script>
  import {getList, getDetail, add, update, remove} from "@/api/wy_push_log/pushlog";
  import {mapGetters} from "vuex";

  export default {
    data() {
      return {
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
          addBtn: false,
          delBtn: false,
          editBtn: false,
          viewBtn: true,
          selection: true,
          dialogClickModal: false,
          column: [
            // {
            //   label: "推送标题",
            //   prop: "pushTitle",
            //   rules: [{
            //     required: true,
            //     message: "请输入推送标题",
            //     trigger: "blur"
            //   }]
            // },
            {
              label: "设备名称",
              prop: "eqName",
              span: 24,
            },
            {
              label: "设备编码",
              prop: "eqCode",
              span: 24,
            },
            {
              label: "设备部门名称",
              prop: "eqDeptName",
              span: 24,
            },
            {
              label: "推送内容",
              prop: "pushContext",
              span: 24,
              rules: [{
                required: true,
                message: "请输入推送内容",
                trigger: "blur"
              }]
            },
            {
              label: "推送时间",
              prop: "pushTime",
              span: 24,
              rules: [{
                required: true,
                message: "请输入推送时间",
                trigger: "blur"
              }]
            },
            {
              label: "推送类型",
              prop: "pushType",
              span: 24,
              slot: true
            },
            // {
            //   label: "是否完成推送",
            //   prop: "isPush",
            //   rules: [{
            //     required: true,
            //     message: "请输入是否完成推送",
            //     trigger: "blur"
            //   }]
            // },
            // {
            //   label: "备注",
            //   prop: "dataRemake",
            //   rules: [{
            //     required: true,
            //     message: "请输入备注",
            //     trigger: "blur"
            //   }]
            // },
          ]
        },
        data: []
      };
    },
    computed: {
      ...mapGetters(["permission"]),
      permissionList() {
        return {
          addBtn: this.vaildData(this.permission.pushlog_add, false),
          viewBtn: this.vaildData(this.permission.pushlog_view, false),
          delBtn: this.vaildData(this.permission.pushlog_delete, false),
          editBtn: this.vaildData(this.permission.pushlog_edit, false)
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
    methods: {
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
