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
                   v-if="permission.uselog_delete"
                   @click="handleDelete">删 除
        </el-button>
      </template> -->
    </avue-crud>
  </basic-container>
</template>

<script>
  import {getList, getDetail, add, update, remove} from "@/api/wy_use_log/uselog";
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
          viewBtn: true,
          addBtn: false,
          delBtn: false,
          editBtn: false,
          selection: true,
          dialogClickModal: false,
          column: [
            // {
            //   label: "设备id",
            //   prop: "equipmentId",
            //   rules: [{
            //     required: true,
            //     message: "请输入设备id",
            //     trigger: "blur"
            //   }]
            // },
            {
              label: "设备名称",
              prop: "eqName",
              search: true,
              rules: [{
                required: true,
                message: "请输入设备id",
                trigger: "blur"
              }]
            },
            {
              label: "设备部门",
              prop: "deptName",
            },
            {
              label: "设备部门",
              prop: "deptId",
              hide: true,
              search: true,
              type: 'tree',
              dicUrl: "/api/blade-system/dept/list",
              dicQuery: {current: 1, size: 1000},
              props: {
                label: "deptName",
                value: "id"
              },
            },
            {
              label: "使用时间",
              prop: "useTime",
              rules: [{
                required: true,
                message: "请输入使用时间",
                trigger: "blur"
              }]
            },
            {
              label: "使用一级分类",
              prop: "useOneType",
              rules: [{
                required: true,
                message: "请输入使用一级分类",
                trigger: "blur"
              }]
            },
            {
              label: "使用二级分类",
              prop: "useTwoType",
              rules: [{
                required: true,
                message: "请输入使用二级分类",
                trigger: "blur"
              }]
            },
            {
              label: "使用三级分类",
              prop: "useThreeType",
              rules: [{
                required: true,
                message: "请输入使用三级分类",
                trigger: "blur"
              }]
            },
            {
              label: "使用四级分类",
              prop: "useFourType",
              rules: [{
                required: true,
                message: "请输入使用四级分类",
                trigger: "blur"
              }]
            },
            {
              label: "使用内容",
              prop: "useContext",
              rules: [{
                required: true,
                message: "请输入使用内容",
                trigger: "blur"
              }]
            },
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
          addBtn: this.vaildData(this.permission.uselog_add, false),
          viewBtn: this.vaildData(this.permission.uselog_view, false),
          delBtn: this.vaildData(this.permission.uselog_delete, false),
          editBtn: this.vaildData(this.permission.uselog_edit, false)
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
        console.log(params);
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
