<template>
	<div class='content'>
		<!-- <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
			<el-input class="sousuo" placeholder="请输入站点名" suffix-icon="el-icon-search" v-model="keyword"
				@keyup.enter.native="search" />
		</div> -->
		<div style="margin-left: 10px;">

			<el-button type="primary" plain  size="mini" @click="putBlackListClick"
				>IP黑名单</el-button>
			<el-button type="primary" plain  size="mini" @click="putWriteListClick"
			>URL白名单</el-button>
		</div>

		<el-table v-loading="loading" class="porTal" ref="multipleTable" :data="tableData" tooltip-effect="dark"
			style="width: 100%">
			<el-table-column type="selection" width="55"></el-table-column>
			<el-table-column label="项目名称" width="120">
				<template slot-scope="scope">{{ scope.row.projectName }}</template>
			</el-table-column>
			<el-table-column label="GET渗透"  align="center" prop="getNum" />
			<el-table-column label="POST渗透"  align="center" prop="postNum" />
			<el-table-column label="恶意User-Agent"  align="center" prop="userAgentNum" />
			<!-- <el-table-column prop="" label="Cookie" width="160">
				<template slot-scope="scope">
					<el-checkbox v-model="checked">4</el-checkbox>
				</template>
			</el-table-column>
			<el-table-column prop="" label="禁国外" width="160">
				<template slot-scope="scope">
					<el-checkbox v-model="checked">4</el-checkbox>
				</template>
			</el-table-column>
			<el-table-column prop="" label="禁国内" width="160">
				<template slot-scope="scope">
					<el-checkbox v-model="checked">4</el-checkbox>
				</template>
			</el-table-column> -->
			<!-- <el-table-column prop="" label="CDN" width="160">
				<template slot-scope="scope">
					<el-checkbox v-model="checked">4</el-checkbox>
				</template>
			</el-table-column> -->
			<el-table-column label="CC攻击"  align="center" prop="ccNum" />
			<el-table-column label="目标网站" align="center" prop="targetSiteUrl" />
			<el-table-column label="代理网站"  align="center" prop="proxySiteUrl" />
			<el-table-column prop="" label="防护状态" width="120">
				<template slot-scope="scope">
					<el-switch v-model="scope.row.enableStatus" @change="handleSwitchChange(scope.row)" active-color="#1890ff"
						inactive-color="#999">
					</el-switch>
				</template>
			</el-table-column>

			<el-table-column label="操作"  align="center">
				<template slot-scope="scope">
					<el-button style="color: #1890ff;" size="mini" type="text" @click="interceptRecord(scope.row)">防护日志</el-button>
					<!-- <span style="padding:0 10px 0 10px;">|</span>
					<el-button style="color: #1890ff;" size="mini" type="text">设置</el-button> -->
					<span style="padding:0 10px 0 10px;">|</span>
					<el-button style="color: #1890ff;" size="mini" type="text"
						@click="openNewTab(scope.row.proxySiteUrl,)">防护测试</el-button>

				</template>
			</el-table-column>
		</el-table>

		<pagination v-show="total > 0" :total="total" :page.sync="queryParams.page
		" :limit.sync="queryParams.pageSize" @pagination="getList" />
		<!-- 拦截日志 -->
		<el-dialog class="lanjie" title="拦截日志" :visible.sync="dialogVisible" width="65%" :close-on-click-modal="false">
			<div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
				<div>
					<span style="padding:0 10px 0 10px;">选择日期:</span>
					<el-button  :style="treeObj"   @click="setToday">今天</el-button>
					<el-button :style="setYesTady"  @click="setYesterday">昨天</el-button>
					<el-button :style="Last7Days" @click="setLast7Days">近7天</el-button>
					<el-button :style="set30Days" @click="setLast30Days">近30天</el-button>
					<el-date-picker v-model="pickerTimes" type="daterange" @change="onDateRangeChange" range-separator="至"
						start-placeholder="开始日期" end-placeholder="结束日期">
					</el-date-picker>
				</div>
				<!-- <div>
					<span style="padding-right: 10px; padding-top: 7px;">IP过滤:</span>
					<el-input class="sousuo" placeholder="请输入站点名" v-model="keyword" @keyup.enter.native="search" />
					<el-button style="margin-left: 10px;">搜索</el-button>
					<span style="margin:0  10px 0 10px; padding-top: 7px; color: #1890ff;">高级搜索</span>
				</div> -->
			</div>
			<el-table class="porTal" ref="multipleTable" :data="protectData" tooltip-effect="dark" style="width: 100%"
				@selection-change="handleSelectionChange">
				<!-- <el-table-column type="selection" width="55"></el-table-column> -->
				<el-table-column label="开始时间" width="180">
					<template slot-scope="scope">{{ scope.row.starTime }}</template>
				</el-table-column>

				<el-table-column label="用户IP" width="120">
					<template slot-scope="scope">
						<span style="color: #1890ff;  cursor: pointer;" @click="blackListClick(scope.row.ip)"> {{ scope.row.ip
						}}</span>
					</template>

				</el-table-column>
				<el-table-column prop="type" label="类型" width="80">
				</el-table-column>
				<el-table-column prop="uri" label="URL地址" width="200">

				</el-table-column>
				<el-table-column prop="" label="状态" width="120">
					<template slot-scope="scope">
						<span> 已拦截</span>
					</template>
				</el-table-column>
				<el-table-column prop="ipCountry" label="IP归属地" width="120">

				</el-table-column>
				<el-table-column prop="filter" label="过滤器" width="120">

				</el-table-column>

				<el-table-column label="操作" >
					<template slot-scope="scope">
						<el-button @click="whiteUrlClick(scope.row.uri)" style="color: #1890ff;" size="mini"
							type="text">URL加白</el-button>
						<span style="padding:0 10px 0 10px;">|</span>
						<el-button style="color: #1890ff;" class="shezhi" size="mini" type="text"
							@click="particulars(scope.row)">详情</el-button>
						<span style="padding:0 10px 0 10px;">|</span>
						<el-button style="color: #1890ff;" class="shezhi" size="mini" type="text"
							@click="HTTPCli(scope.row)">HTTP</el-button>

					</template>
				</el-table-column>
			</el-table>

			<pagination v-show="interceptTotal > 0" :total="interceptTotal" :page.sync="queryParams.page
			" :limit.sync="queryParams.pageSize" @pagination="interceptList" />


			<!-- 详情 -->
			<el-dialog width="50%" title="详情" :close-on-click-modal="false" :visible.sync="innerVisible" append-to-body>
				<div class="xiangqing">
					<div class="shijian">
						<div style="width: 50%; ">
							<span style="padding:0 30px 0 10px; font-weight: 700; ">时间</span>
							<span>{{ particularsTab.starTime }}</span>
						</div>
						<div style="width: 50%; ">
							<span style="padding:0 30px 0 10px; font-weight: 700; ">攻击IP</span>
							<span style="color: #1890ff;  cursor: pointer;" @click="blackListClick(particularsTab.ip)">{{ particularsTab.ip }}</span>
						</div>

					</div>
					<div class="shijian1">
						<div style="width: 50%; ">
							<span style="padding:0 30px 0 10px; font-weight: 700; ">类型</span>
							<span>{{ particularsTab.type }}</span>
						</div>
						<div style="width: 50%; ">
							<span style="padding:0 30px 0 10px; font-weight: 700; ">过滤器</span>
							<span>{{ particularsTab.filter }}</span>
						</div>

					</div>

				</div>
				<div style="margin: 20px  0 10px 10px; font-weight: 700;">URI地址</div>
				<div class="dizhi">{{ particularsTab.uri }}</div>
				<div style="margin: 20px  0 10px 10px; font-weight: 700;">User-Agent</div>
				<div class="dizhi">{{ particularsTab.userAgent }}</div>
				<div style=" display: flex;justify-content: space-between;">
					<div style="margin: 20px  0 10px 10px; font-weight: 700;">过滤规则</div>
					<div style="margin: 20px  10px 10px 10px; font-weight: 700; color: #1890ff; cursor: pointer;"
						@click="whiteUrlClick(particularsTab.uri)">
						URL加白</div>
				</div>
				<div class="dizhi">{{ particularsTab.filterRule }}</div>
				<div style="margin: 20px  0 10px 10px; font-weight: 700;">传入值</div>
				<div class="dizhi">{{ particularsTab.incomingValue }}</div>
				<div style="margin: 20px  0 10px 10px; font-weight: 700;">风险值</div>
				<div class="dizhi">{{ particularsTab.riskValue }}</div>
			</el-dialog>
			<el-dialog width="65%" title="HTTP详情" :close-on-click-modal="false" :visible.sync="HTTPVisible" append-to-body>
				<pre class="wenben" >
					{{ httpLog }}
				</pre>
			</el-dialog>
			<span slot="footer" class="dialog-footer">
				<el-button @click="dialogVisible = false">关 闭</el-button>
			</span>
		</el-dialog>
		<el-dialog title="加入URL白名单" style="margin-top: 15vh;" append-to-body :close-on-click-modal="false"
			:visible.sync="whiteVisible" width="20%">
			<div style="display: flex;">
				<i class="el-icon-question custom-icon1"></i>
				<span style="font-size: 15px;padding-left: 10px;;">加入URL白名单后此URL将不再进行防护，是否继续操作？</span>
			</div>

			<span slot="footer" class="dialog-footer">
				<el-button @click="whiteVisible = false">取 消</el-button>
				<el-button type="primary" plain @click="reqWhiteList()">确 定</el-button>
			</span>
		</el-dialog>
		<!-- 黑名单 -->
		<el-dialog title="加入IP黑名单" append-to-body :close-on-click-modal="false" :visible.sync="blacklistVisible" width="20%">
			<div style="display: flex;">
				<i class="el-icon-warning-outline custom-icon1"></i>
				<span style="font-size: 15px;padding-left: 10px;">是否将 {{ blackIp }} 添加到黑名单</span>
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button @click="blacklistVisible = false">取 消</el-button>
				<el-button type="primary" plain @click="requireBlack(blackIp)">确 定</el-button>
			</span>
		</el-dialog>


		<el-dialog title="管理IP黑名单" append-to-body :close-on-click-modal="false" :visible.sync="putBlackVisible" width="40%">
			<div>
				<div>IPv4黑名单</div>

				<el-form :rules="rules" :model="ruleForm" ref="ruleForm">
					<div class="ipDizhi">
						<el-form-item prop="startIpAddress" style=" width: 43%;">
							<el-input v-model="ruleForm.startIpAddress" placeholder="起始IP地址"></el-input></el-form-item>
						<el-form-item prop="endIpAddress" style=" width: 43%;">
							<el-input v-model="ruleForm.endIpAddress" placeholder="结束IP地址">
							</el-input></el-form-item>
						<el-button @click="addBlackIp('ruleForm')" style="height: 34px;" type="primary">添加</el-button>
					</div>
				</el-form>
				<right-toolbar class="iconClass" :showSearch="false" @queryTable="putBlackListClick"></right-toolbar>
				<div>
					<el-table height="300" :data="blacktableData" style="width: 100% ; border: 1px solid #eee;">
						<el-table-column label="起始IP" align="center" >
							<template slot-scope="scope">{{ scope.row.startIp }}</template>
						</el-table-column>
						<el-table-column prop="name" label="结束IP" align="center" >
							<template slot-scope="scope">{{ scope.row.endIp }}</template>
						</el-table-column>
						<el-table-column label="操作" align="center">
							<template slot-scope="scope">
								<a style="color: red; " @click="deleteBlackList(scope.row.index)" class="operation">删除</a>
							</template>
						</el-table-column>
					</el-table>
					<el-button @click="clearBlackList()" style="margin-top: 20px;" type="primary">清空</el-button>
				</div>
				<ul>
					<li>黑名单中的IP段将被禁止访问</li>
					
			
				</ul>

			</div>

		</el-dialog>

		<el-dialog title="管理URL白名单" append-to-body :close-on-click-modal="false" :visible.sync="putWriteVisible" width="40%">
			<div>
				<div style="margin-bottom: 15px;">URL白名单</div>
				<el-form :rules="rules" :model="writeForm" ref="writeForm">
					<div style="display: flex;">
						<el-form-item prop="url" style="margin-right: 15px; width: 80%;">
							<el-input v-model="writeForm.url" placeholder="URL地址，例如: /admin/update">
							</el-input>
						</el-form-item>
						<el-button @click="addWhiteList(writeForm.url, 'writeForm')" style="height: 34px;"
							type="primary">添加</el-button>
					</div>
				</el-form>
				<div >
					<right-toolbar class="iconClass" :showSearch="false" @queryTable="putWriteListClick"></right-toolbar>
					<el-table height="300" :data="whitetableData" style="width: 100% ; border: 1px solid #eee;"  >
						<el-table-column prop="url" label="URL" >
						</el-table-column>
						<el-table-column label="操作" align="center">
							<template slot-scope="scope">
								<a style="color: red;" @click="deleteWhiteList(scope.row.index)" class="operation">删除</a>
							</template>
						</el-table-column>

					</el-table>
					<el-button @click="clearWhiteList()" style="margin-top: 20px;" type="primary">清空</el-button>
				</div>
				<ul>
					<li>所有规则对白名单中的URL无效。</li>
					<li>不包括IP黑名单。当前URL白名单不支持带参数。</li>
					<li>例子1 : /admin/upload?type=jpg添加地址/admin/upload</li>
					<li>例子2：/admin/test匹配所有以/admin/test开头的url，如/admin/test/123</li>
				</ul>

			</div>

		</el-dialog>



	</div>
</template>

<script>
import {
	getProtectionSiteListI, getProtectionSitLogI, addBlackIpI, getBlackIpListI, deleteBlackIpI, clearBlackIpI, getWhiteUrlListI, deleteWhiteUrlI, clearWhiteUrlI
} from "@/api/system/protectedSitesList";
import {
	addWhiteUrlI,
	lockIpI,
} from "@/api/system/overview";

import {
	protectionSwitchI
} from "@/api/system/project";
export default {
	name: '',
	//import引入的组件需要注入到对象中才能使用
	components: {},
	data () {
		return {
			bgcObj4: {
        backgroundColor: "#409eff",
				color:"#fff"
      },
			bgcObj3: {
        backgroundColor: "#409eff",
				color:"#fff"
      },
			bgcObj2: {
        backgroundColor: "#409eff",
				color:"#fff"
      },
			bgcObj: {
        backgroundColor: "#409eff",
				color:"#fff"
      },
			treeObj: "",
			setYesTady: "",
			Last7Days: "",
			set30Days:'',


			whitetableData: [],
			writeForm: {
				url: ''
			},
			ruleForm: {
				startIpAddress: '',
				endIpAddress: '',
			},
			rules: {
				url: [
					{ required: true, message: "请输入URL地址", trigger: "change" },
				],
				endIpAddress: [
					{ required: true, message: "请输IP地址", trigger: "change" }, ,
					{
						pattern:
							/(?:(?:1[0-9][0-9]\.)|(?:2[0-4][0-9]\.)|(?:25[0-5]\.)|(?:[1-9][0-9]\.)|(?:[0-9]\.)){3}(?:(?:1[0-9][0-9])|(?:2[0-4][0-9])|(?:25[0-5])|(?:[1-9][0-9])|(?:[0-9]))/,
						message: "请输入正确的Ipv4地址。例如:Ipv4地址:192.168.0.1",
					},
					{
						min: 6,
						max: 18,
						message: "长度在 6 到 18 个字符",
					},
				],
				startIpAddress: [
					{ required: true, message: "请输入IP地址", trigger: "change" }, ,
					{
						pattern:
							/(?:(?:1[0-9][0-9]\.)|(?:2[0-4][0-9]\.)|(?:25[0-5]\.)|(?:[1-9][0-9]\.)|(?:[0-9]\.)){3}(?:(?:1[0-9][0-9])|(?:2[0-4][0-9])|(?:25[0-5])|(?:[1-9][0-9])|(?:[0-9]))/,
						message: "请输入正确的Ipv4地址。例如:Ipv4地址:192.168.0.1",
					},
					{
						min: 6,
						max: 18,
						message: "长度在 6 到 18 个字符",
					},
				],

			},

			putWriteVisible: false,
			putBlackVisible: false,
			httpLog: '',
			whiteUrl: '',
			blackIp: '',
			blacklistVisible: false,
			particularsTab: {},
			presentId: "",
			pickerTimes: '',
			loading: false,
			total: 0,
			interceptTotal: 0,
			queryParams: {
				page: 1,
				pageSize: 10,
			},
			HTTPVisible: false,
			whiteVisible: false,
			innerVisible: false,
			startDate: '',
			endDate: '',
			dialogVisible: false,
			keyword: "",
			switchVal: true,
			checked: true,
			currentPage: 4,
			tableData: [],
			protectData: [],
			blacktableData: [],
		};
	},
	//监听属性 类似于data概念
	computed: {},
	//监控data中的数据变化
	watch: {
	
	},
	//方法集合
	methods: {
		writeReset() {
      this.writeForm = {
        url: null,
      };
      this.resetForm("writeForm");
    },
		reset() {
      this.ruleForm = {
        startIpAddress: null,
        endIpAddress: null,
      };
      this.resetForm("ruleForm");
    },
		//删除白名单
		deleteWhiteList (index) {
			this.$confirm('此操作将永久删除该列表行, 是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				let data = {
					index: index
				}
				deleteWhiteUrlI(data).then((res => {
					if (res.code == 200) {
						this.$message({
							type: 'success',
							message: '删除成功!',
							duration: 3000,
						});
						this.putWriteListClick()
					}
				}))
			}).catch(() => {
			});


		},
		//清空白名单
		clearWhiteList () {
			this.$confirm('此操作将永久清空该列表, 是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				clearWhiteUrlI().then((res => {
					if (res.code == 200) {
						this.$message({
							type: 'success',
							message: '清空成功!',
							duration: 3000,
						});
						this.putWriteListClick()
					}
				}))
			}).catch(() => {
			});

		},
		//清空黑名单列表
		clearBlackList () {
			this.$confirm('此操作将永久清空该列表, 是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				clearBlackIpI().then((res => {
					if (res.code == 200) {
						this.$message({
							type: 'success',
							message: '清空成功!',
							duration: 3000,
						});
						this.putBlackListClick()
					}
				}))
			}).catch(() => {
			});

		},
		deleteBlackList (index) {
			this.$confirm('此操作将永久删除该列表行, 是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				let data = {
					index: index
				}
				deleteBlackIpI(data).then((res => {
					if (res.code == 200) {
						this.$message({
							type: 'success',
							message: '删除成功!',
							duration: 3000,
						});
						this.putBlackListClick()
					}
				}))
			}).catch(() => {
			});
		},
		//添加白名单
		addWhiteList (url,form) {

			this.$refs[form].validate((valid) => {
				if (valid) {
					this.whiteUrl = url
					this.reqWhiteList()
					this.putWriteListClick()

				}
			});
		},
		//添加黑名单
		addBlackIp (form) {
			this.$refs[form].validate((valid) => {
				if (valid) {

					let data = {
						startIp: this.ruleForm.startIpAddress,
						endIp: this.ruleForm.endIpAddress,
					}
					addBlackIpI(data).then((res => {

						if (res.code == 200) {
							this.$message({
								message: res.msg,
								duration: 3000,
								type: 'success'
							});
							this.putBlackListClick()
						} else {
							this.$message.error({
								message: res.msg,
								duration: 3000,
							});
							// this.putBlackVisible = false
						}

					}))

				}
			})


		},
		// ip白名单
		putWriteListClick () {
			this.writeReset()
			getWhiteUrlListI().then((res => {
				this.whitetableData = res.data
			}))
			this.putWriteVisible = true
		},
		// ip黑名单
		putBlackListClick () {
			this.reset()
			getBlackIpListI().then((res => {
				this.blacktableData = res.data
			}))
			this.putBlackVisible = true
		},
		// 确定加入黑名单
		requireBlack (ip) {
			let data = { ip: ip }
			lockIpI(data).then((res => {
				if (res.code == 200) {
					this.$message({
						message: "已添加到黑名单",
						duration: 3000,
						type: 'success'
					});
					this.blacklistVisible = false
				} else {
					this.$message.error({
						message: res.msg,
						duration: 3000,
					});
				}

			}))


		},
		blackListClick (i) {
			this.blackIp = i
			this.blacklistVisible = true

		},
		
		// 添加url白名单
		reqWhiteList () {
			let data = {
				url: this.whiteUrl
			}
			addWhiteUrlI(data).then((res => {
				if (res.code == 200) {
					this.$message({
						message: "已添加到白名单",
						duration: 3000,
						type: 'success'
					});
					this.whiteVisible = false

				} else {
					this.$message.error({
						message: res.msg,
						duration: 3000,
					});
				}
			}))
		},
		whiteUrlClick (url) {
			this.whiteUrl = url
			this.whiteVisible = true
		},
		handleSwitchChange (row) {
			row.enableStatus = !row.enableStatus
			if (row.enableStatus == true) {
				this.$confirm('您是否要关闭防护？', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					let state = 0
					let data = {
						projectId: row.projectId,
						status: state
					}
					protectionSwitchI(data).then((res => {
						row.enableStatus = false
					}))

					// 用户点击确定按钮，执行相关操作
				}).catch(() => {
					// 用户点击了取消按钮，不做任何操作
				});

			} else {
				this.$confirm('您是否要开启防护？', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					let state = 1
					let data = {
						projectId: row.projectId,
						status: state
					}
					protectionSwitchI(data).then((res => {
						row.enableStatus = true
					}))
					// 用户点击确定按钮，执行相关操作
				}).catch(() => {
					// 用户点击了取消按钮，不做任何操作
				});
			}
		},
		openNewTab (i) {
			window.open(`http://${i}/?id=1%27union%20select%20user(),1,3--`, "_blank");
		},
		/** 查询项目列表列表 */
		getList () {
			// this.loading = true;
			getProtectionSiteListI(this.queryParams).then((response) => {
				this.tableData = response.data.data;
				this.total = response.data.data.length;
				// this.loading = false;
			});
		},
		HTTPCli (row) {
			// console.log(row.httpLog);
			// this.httpLog =  row.httpLog.indexOf('b"')>-1?row.httpLog.substring(2,row.httpLog.length-1).replace(/\\n/g," \n"):row.httpLog.replace(/\\n/g," \n");
			// console.log(this.httpLog);
			this.httpLog = row.httpLog
			this.HTTPVisible = true
		},

		// 详情
		particulars (row) {
			this.particularsTab = row
			this.innerVisible = true
		},
		setToday () {
			this.treeObj=this.bgcObj
			this.setYesTady=''
			this.Last7Days=''
			this.setYesTady=''
			const today = new Date();
			this.setDateRange(today, today);
			this.pickerTimes=[ today,today]
		},
		setYesterday () {
			this.setYesTady=this.bgcObj2
			this.treeObj=""
			this.Last7Days=''
			this.set30Days=''
			const today = new Date();
			const yesterday = new Date(today);
			yesterday.setDate(today.getDate() - 1);
			this.setDateRange(yesterday, yesterday);
			this.pickerTimes=[ yesterday,today]
		},
		setLast7Days () {
			this.Last7Days=this.bgcObj3
			this.treeObj=""
			this.setYesTady=''
			this.set30Days=''
			const today = new Date();
			const last7days = new Date(today);
			last7days.setDate(today.getDate() - 6);
			this.setDateRange(last7days, today);
			this.pickerTimes=[ last7days,today]

		},
		setLast30Days () {
			this.set30Days=this.bgcObj4
			this.Last7Days=''
			this.treeObj=""
			this.setYesTady=''

			const today = new Date();
			const last30days = new Date(today);
			last30days.setDate(today.getDate() - 29);
			this.setDateRange(last30days, today);
			this.pickerTimes=[ last30days,today]

		},
		setDateRange (start, end) {
			this.startDate = start.getFullYear() + '-' + (start.getMonth() + 1) + '-' + start.getDate();
			this.endDate = end.getFullYear() + '-' + (end.getMonth() + 1) + '-' + end.getDate();
			this.interceptList()

		},


		onDateRangeChange (dates) {
			this.Last30Days=''
			this.Last7Days=''
			this.treeObj=""
			this.set30Days=''

			const today = dates[0]
			const lastDays = dates[1]
			this.setDateRange(today, lastDays)

		},

		interceptList () {
			this.protectData=[]
			let data = {
				id: this.presentId,
				startDate: this.startDate,
				endDate: this.endDate,
				pageSize: this.queryParams.pageSize,
				page: this.queryParams.page,
			}
			getProtectionSitLogI(data).then((res => {
				this.protectData = res.data.data
				this.interceptTotal = res.data.page.total
				this.dialogVisible = true
			
			}))
		},

		interceptRecord (row) {
			this.presentId = row.id
			this.setToday()
			this.interceptList()
			
		},
		// 搜索
		search () {
			console.log(`Searching for ${this.keyword}`);
			// 执行搜索操作，可以发送请求到后端获取数据
		},

		handleSelectionChange (val) {
			this.multipleSelection = val;
		},
		handleSizeChange (val) {
			// console.log(`每页 ${val} 条`);
		},
		handleCurrentChange (val) {
			// console.log(`当前页: ${val}`);
		}

	},
	//生命周期 - 创建完成（可以访问当前this实例）
	created () {
		this.getList()
	},
	//生命周期 - 挂载完成（可以访问DOM元素）
	mounted () {

	},
	beforeCreate () { }, //生命周期 - 创建之前
	beforeMount () { }, //生命周期 - 挂载之前
	beforeUpdate () { }, //生命周期 - 更新之前
	updated () { }, //生命周期 - 更新之后
	beforeDestroy () { }, //生命周期 - 销毁之前
	destroyed () { }, //生命周期 - 销毁完成
	activated () { }, //如果页面有keep-alive缓存功能，这个函数会触发
}
</script>
<style scoped>
.sousuo {
	width: 200px;
}

.custom-icon1 {
	font-size: 2em;
	color: #f89d42;
	/* 修改为你需要的颜色 */
}

.custom-icon {
	font-size: 1.25em;
	color: #f89d42;
	/* 修改为你需要的颜色 */
}

/* @import url(); 引入公共css类 */
.porTal /deep/ .el-checkbox__input.is-checked .el-checkbox__inner {
	background-color: #1890ff;
	border-color: #1890ff;
}

.porTal /deep/ .el-checkbox__input.is-checked+.el-checkbox__label {
	color: #1890ff;
	/* 修改此处的颜色 */
}

.content {
	margin-top: 20px;
}

.lanjie /deep/ .el-button+.el-button {
	margin-left: 0px;
}

.lanjie /deep/ .el-button--medium {
	padding: 10px 20px;
	font-size: 14px;
	border-radius: 0px;
}

.xiangqing {
	width: 100%;
	height: 80px;
	border: 1px solid #eee;
}

.shijian1 {
	display: flex;
	height: 40px;
	line-height: 40px;
}

.shijian {
	display: flex;
	height: 40px;
	line-height: 40px;
	border-bottom: 1px solid #eee;
}

.dizhi {
	width: 100%;
	line-height: 40px;
	background-color: #f6f6f6;
	border-radius: 5px;
	padding: 10px;
}

.wenben {
	width: 100%;
	text-indent: -33ch;
	white-space: pre-wrap;
  
	background-color: #f6f6f6;
	border: 1px solid #eee;
	border-radius: 5px;
	/* overflow: auto; */
	text-align-last: left;
}

.ipDizhi {
	margin-top: 10px;
	margin-bottom: 15px;
	display: flex;
	justify-content: space-between;
}

.ipDizhi /deep/ .el-input {
	margin-right: 15px;
}

.iconClass /deep/ .el-row .el-button:first-child {
  display: none;
}


</style>
