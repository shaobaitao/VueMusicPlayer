
    new Vue({
    el: '#app',
    data: function () {
        return {

            tableData: [{}],
            url_data:[{}],
            dialogVisible: false,//编辑div显示flag
            current_index: 0,//用户编辑的行编号
            target_index:0,
            words: '',//搜索的文本
            ids_string:"",
            server_url:"http://shaobaitao.cn:3000/",//aip接口url

            volume:30,
            current_time:0,
            duration_time:"",
            body_sign:true,
            mid_icon:"el-icon-video-play",
            first_play_sign:true,
        }
    },
    methods: {
        click_play(row){
            this.target_index=row.index;
        },
        double_click_play(row){
            this.target_index=row.index;
        },
        SelectedStyle ({row, rowIndex}) {
            if (this.current_index === rowIndex ) {
                return {
                    // "background-color": "rgba(64,64,64,1)"
                };
            }
            // console.log(rowIndex);
        },
        tableRowClassName ({row, rowIndex}) {
            row.index = rowIndex;
            if(rowIndex===this.current_index){
                return 'active'
            }
            if(rowIndex%2===1){
                return 'stripe'
            }
        },
        author_formatter(row){
            let arr = []
            if(row.ar){
                row.ar.forEach(item=>{
                    arr.push(item.name);
                })
            }
            return arr.join('、')
        },
        duration_formatter(row){
            var sec= Math.floor(row.dt/1000)
            var min= Math.floor(sec/60)
            sec%=60
            if(min<10) min="0"+min
            if(sec<10) sec="0"+sec
            return min+":"+sec
        },
        test_click(){
            console.log(this.tableData)
        },


        play_pause(){

            if(this.$refs.audio.paused){
                this.$refs.audio.play()
                this.mid_icon="el-icon-video-pause"
            }
            else{
                this.$refs.audio.pause();//音频暂停
                this.mid_icon="el-icon-video-play"
            }
        },
        play_pre(){
            this.target_index--;
        },
        play_next(){
            this.target_index++;
        },
        play_end(){
            console.log(1)
            this.change_law()
        },
        change_law(){
            this.target_index++
        },
        pg_bar_input(){
            this.$refs.audio.currentTime=this.$refs.audio.duration*(this.$refs.pg_bar.value*0.01)
            // console.log(this.$refs.pg_bar.value)
        },
        volume_bar_input(){
            this.$refs.audio.volume=this.$refs.volume_bar.value/100

            var valStr = this.volume + "% 100%";
            $('#volume_bar').css({
                "background-size": valStr
            })
        },
        play_ontimeupdate(){
            this.$refs.pg_bar.value=100*(this.$refs.audio.currentTime/this.$refs.audio.duration)
            //它这个实现的是滑块已播放的颜色
            //因为我以前这个功能是用JQ实现的 Vue里面不知道怎么弄 所以这里用JQ了 -.-
            var valStr = this.$refs.pg_bar.value + "% 100%";
            $('#progress_bar').css({
                "background-size": valStr
            })

            this.current_time=this.$refs.audio.currentTime
            this.duration_time=this.$refs.audio.duration

        },
        time_formatter(time){
            let sec= parseInt(time)
            let min= Math.floor(sec/60)
            sec%=60
            if(min<10) min="0"+min
            if(sec<10) sec="0"+sec
            return min+":"+sec
        },


    },
    watch:{


    },
    computed:{

        audio_url(){
            if(!this.tableData[this.target_index].id){
                return ""
            }
            axios.post(this.server_url+"song/url?id="+this.tableData[this.target_index].id)
                .then(response => {
                    if(response.data.data[0].url){
                        this.url_data=response.data.data[0].url
                        this.current_index=this.target_index
                        this.$refs.audio.volume=this.volume/100

                        this.$refs.audio.play()

                    }
                    else{
                        // var win_height=window.screen.height;
                        // console.log(win_height)
                        this.$message({
                            message: '此歌曲播放需要VIP',
                            type: 'warning',
                            offset:300//离窗口上部高度  可以配合获取窗口调高度
                        });
                    }
                })
                .catch(function (error) { // 请求失败处理
                    // console.log(error);
                });
            return this.url_data
        },

        img_url(){
            if(this.tableData.length>1){
                // console.log(this.tableData)
                return this.tableData[this.current_index].al.picUrl+"?param=200y200"
            }
            else{
                return ""
            }
        },
        get_song_author(){
                if(!this.tableData[this.current_index].ar){
                    return
                }

            console.log(this.tableData)
            let s=[];

            this.tableData[this.current_index].ar.forEach(item=>{
                s.push(item.name);
            })
            // console.log(s)
            return s.join('、')

        },

        get_current(){
            let sec= parseInt(this.current_time)
            let min= Math.floor(sec/60)
            sec%=60
            if(min<10) min="0"+min
            if(sec<10) sec="0"+sec
            return min+":"+sec
        },
        get_duration(){
            let sec= parseInt(this.duration_time)
            let min= Math.floor(sec/60)
            sec%=60
            if(min<10) min="0"+min
            if(sec<10) sec="0"+sec
            return min+":"+sec
        },

    },
    created(){
        let list=[];
        let list_id="740322272"
        //533810721 5085212318
        axios.post(this.server_url+"playlist/detail?id="+list_id)
            .then(response => {
                for (let i = 0; i < response.data.playlist.trackIds.length; i++) {
                    list.push(response.data.playlist.trackIds[i].id);
                    // list.push(json.privileges[i].id);
                }
                this.ids_string=list[0];
                for (let i = 1; i < list.length; i++) {
                    this.ids_string+=","+list[i];
                }
                axios.post(this.server_url+"song/detail?ids="+this.ids_string)
                    .then(response => (
                        this.tableData=response.data.songs
                    ))
                    .catch(function (error) { // 请求失败处理
                        console.log(error);
                    });
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            })
    },
    mounted() {



    }
})