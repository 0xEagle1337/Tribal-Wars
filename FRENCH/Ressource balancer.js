try {
    if (!game_data.features.Premium.active) {
        UI.ErrorMessage("Le compte a besoin d'un compte premium pour utiliser ce script.");
    } else {
        var villagesAlreadySent = []
        var is_mobile = !!navigator.userAgent.match(/iphone|android|blackberry/ig) || false;
        let targetVillage
        const sendResourcesToVillage = $('#sendResourcesToVillage')
        sendResourcesToVillage.slideUp('slow', function () {
            sendResourcesToVillage.remove();
        })

        if (game_data.screen === 'info_village') {
            getVillage($("td:contains('Coordonnées:'):last, span:contains('Coordonnées:')").next().text())
        } else {
            AskCoordPopup()
        }

        function AskCoordPopup() {
            let html = `<div>
                        <h1>Envoi de ressources</h1>
                        <br>
                        <div style="text-align:center">
                            <b id="target">Coordonnée: </b>                         
                            <input id="CoordToSend" name="CoordToSend" type="text"/>
                            <br><br>
                            <input type="button" class="btn evt-confirm-btn btn-confirm-yes"
                                value="Afficher les paramètres d'envoi"
                                onclick="checkSettingAskCoord()">
                        </div>
                    </div>`
            Dialog.show("Content", html);
        }

        function checkSettingAskCoord() {
            let coordValue = $('#CoordToSend').val();
            if (!coordValue.match(/^[0-9]{1,3}\|[0-9]{1,3}$/g)) {
                UI.ErrorMessage("La coordonnée spécifiée est incorrecte !")
                return
            }
            $('.popup_box_close').click()
            getVillage(coordValue)
        }

        function getVillage(coord) {
            TribalWars.get("api", {
                ajax: 'target_selection',
                input: coord,
                type: 'coord'
            }, (data) => {
                if (data.villages.length === 0) UI.ErrorMessage("Le village spécifié n'existe pas !");
                targetVillage = data.villages[0];
                ShowSettingsPopup();
            })
        }

        function getTargetElement(village) {
            const player = `<a href="${game_data.link_base_pure}info_player&id=${village.player_id}">${village.player_name}</a>`
            return `${village.name} <b>(${player})</b>`
        }

        function ShowSettingsPopup() {
            $.get(game_data.link_base_pure + 'groups&ajax=load_groups')
                .then((group) => {
                    let html = `
                <div>
                    <h1>Envoi de ressouces au village</h1>
                    <b id="target"Cible: </b>${getTargetElement(targetVillage)}<br><br>
                    <b>Groupe: </b><select id="group">`;

                    group.result.forEach(function (item) {
                        html += `<option value="${item.group_id}">${item.name}</option>`
                    })

                    html += `   </select><br><br>
                        <b>Modèle de ratio: </b><br>
                        <input type="radio" id="equal" name="ratio" value="33.3,33.3,33.3" title="Ratio de ressources a envoyer. Format = '33.3, 33.3, 33.3'">
                        <label for="equal">Homogène <i>(33.3, 33.3, 33.3)</i></label><br>
                        <input type="radio" id="noble" name="ratio" value="28.6,35.7,35.7" title="Ratio de ressources a envoyer. Format = '33.3, 33.3, 33.3'">
                        <label for="noble">Noble <i>(28.6, 35.7, 35.7)</i></label><br>
                        <input type="radio" id="coin" name="ratio" value="33.5,36.1,30.1" title="Ratio de ressources a envoyer. Format = '33.3, 33.3, 33.3'">
                        <label for="coin">Troupes <i>(33.5, 36.1, 30.1)</i></label><br>
                        <input type="radio" id="other" name="ratio" value="other" title="Ratio de ressources a envoyer. Format = '33.3, 33.3, 33.3'">
                        <label for="other">Autre<input type="text" placeholder="33.3, 33.3, 33.3" oninput="otherRatioInput(this)"/></label>
                        <br><br>
                        <label for="spareLimit" title="Ressources à laisser dans le village"><b>Montant minimum à laisser: </b></label>
                        <input id="spareLimit" name="spareLimit" type="number" value="9000" min="0"/>
                        <br><br>
                        <label for="minimumToSend" title="Ressources à envoyer au minimum: "><b>Montant minimum à envoyer: </b></label>
                        <input id="minimumToSend" name="minimumToSend" type="number" value="1000" min="0"/>
                        <br><br>
                        <label for="tradersHome" title="Marchands à laisser dans le village"><b>Marchands à laisser dans les villages: </b></label>
                        <input id="tradersHome" name="tradersHome" type="number" value="0" min="0"/><br><br>

                        <input type="button" class="btn evt-confirm-btn btn-confirm-yes"
                               id="createTable"
                               value="Générer"
                               onclick="checkSetting()">
                </div>`
                    Dialog.show("Content", html);
                    $('#equal').prop("checked", true);
                })
        }

        function otherRatioInput(x) {
            $("#other").prop("checked", true);
            $('#other').val(x.value)
        }

        let ratio = [33.3, 33.3, 33.3];
        let spareLimit = 9000;
        let minimumToSend = 1000;
        let tradersHome = 0;

        function checkSetting() {
            ratio = $("input[name='ratio']:checked").val();
            spareLimit = parseInt($("#spareLimit").val());
            minimumToSend = parseInt($("#minimumToSend").val());
            tradersHome = parseInt($("#tradersHome").val());
            let group = parseInt($('#group').val());

            if (tradersHome < 0 || spareLimit < 0 || minimumToSend < 0 || !ratio.match(/^[0-9]{1,3}(\.[0-9])?,\s*[0-9]{1,3}(\.[0-9])?,\s*[0-9]{1,3}(\.[0-9])?$/g)) {
                UI.ErrorMessage("Il y a une erreur dans les paramètres spécifiés")
                return
            }
            ratio = ratio.replace(/\s/g, '').split(",");
            $('.popup_box_close').click()
            createTable(group)
        }

        function createTable(group) {
            is_mobile
                ? $('#content_value').before(getTable())
                : $('#contentContainer > tbody').before(getTable());
            UI.InitProgressBars();
            UI.updateProgressBar($('#SendResourcesToVillageProgessbar'), 0, '?')
            loadTwAjax();

            $.get(game_data.link_base_pure + `overview_villages&mode=prod&group=${group}&page=-1&`)
                .then((result) => {
                        debugger;
                        const villages = $.map(
                            $(result).find('#production_table > tbody > tr.nowrap'),
                            (val) => is_mobile
                                ? getVillageInfoMobile(val)
                                : getVillageInfoDesktop(val)
                        )
                        let villageCount = 0
                        villages.forEach(function (village) {
                            const calculateResources = calculateResource(village)
                            if (calculateResources[0] === 0) return;
                            else villageCount++
                            if (targetVillage.id == village.id) return;
                            $('#tableSend > tbody').append(getTableRow(village, targetVillage, calculateResources))
                            $(`[id="sendResourceButton-${village.id}"]`).click(
                                () => {
                                    $(this).prop('disabled', true);
                                    sendResource(village.id, targetVillage.id, calculateResources[0], calculateResources[1], calculateResources[2])
                                }
                            )
                        });
                        updateProgressBar(villageCount)
                        $('[id^="sendResourceButton-"]').first().focus()
                    }
                )
        }

        function updateProgressBar(length) {
            if (typeof updateProgressBar.counter == 'undefined') {
                updateProgressBar.counter = -1;
            }
            if (typeof updateProgressBar.maxCount == 'undefined') {
                updateProgressBar.maxCount = length;
            }
            updateProgressBar.counter++;
            UI.updateProgressBar($('#SendResourcesToVillageProgessbar'), updateProgressBar.counter, updateProgressBar.maxCount)
        }

        function getVillageInfoDesktop(val) {
            const village = $(val).find('.quickedit-vn');
            const villageName = village.find('.quickedit-label').text().trim();
            const coord = villageName.match(/[0-9]{3}\|[0-9]{3}/g)[0].split('|');
            return {
                id: village.data('id'),
                x: parseInt(coord[0]),
                y: parseInt(coord[1]),
                name: villageName,
                traders: parseInt($(val).find('td:nth-child(6) > a').text().split('/')[0]),
                resources: [
                    parseInt($(val).find('span.wood').text().replace(/\./g, "")),
                    parseInt($(val).find('span.stone').text().replace(/\./g, "")),
                    parseInt($(val).find('span.iron').text().replace(/\./g, ""))
                ]
            }
        }

        function getVillageInfoMobile(val) {
            const village = $(val).prev().find('.quickedit-vn');
            const villageName = village.find('.quickedit-label').text().trim();
            const coord = villageName.match(/[0-9]{3}\|[0-9]{3}/g)[0].split('|');
            return {
                id: village.data('id'),
                x: parseInt(coord[0]),
                y: parseInt(coord[1]),
                name: villageName,
                traders: parseInt($(val).find('td tr:nth-child(3) a').text().split('/')[0]),
                resources: [
                    parseInt($(val).find('span.mwood').text().replace(/\./g, "")),
                    parseInt($(val).find('span.mstone').text().replace(/\./g, "")),
                    parseInt($(val).find('span.miron').text().replace(/\./g, ""))
                ]
            }
        }

        function calculateResource(village, capacity = village.traders * 10, calculatedResources = [0, 0, 0]) {
            capacity -= tradersHome * 10;
            if (capacity < 0){
                capacity =0;
            }
            village.resources.forEach((resource, index) => {
                const availableToSend = resource > spareLimit && resource - spareLimit > minimumToSend ? resource - spareLimit : 0;
                const gsRatio = ratio[index];
                const calculated = parseInt(capacity * gsRatio);
                if (calculated > availableToSend) {
                    capacity = (availableToSend / gsRatio);
                    calculateResource(village, capacity, calculatedResources);
                } else {
                    calculatedResources[index] = calculated;
                }
            });
            return calculatedResources
        }


        function checkIfVillageIsSent(village) {
            return villagesAlreadySent.includes(village)
        }

        function addVillageToSendList(village) {
            villagesAlreadySent.push(village)
        }

        function sendResource(sourceID, targetID, wood, stone, iron) {
            if ($("#recaptcha-anchor-label").length > 0) {
                alert("Captcha détecté ! Rafraichissez la page !");
                window.location.reload();
            }
            if (checkIfVillageIsSent(sourceID)) return
            else {
                addVillageToSendList(sourceID)
            }
            $.twAjax({
                url: `/game.php?village=${sourceID}&screen=market&ajaxaction=map_send`,
                data: {
                    target_id: targetID,
                    wood: wood,
                    stone: stone,
                    iron: iron,
                    h: game_data.csrf
                },
                type: 'POST',
                dataType: "json",
                headers: {'TribalWars-Ajax': 1},
                success: (result) => {
                    $(`[id="sendResourceButton-${sourceID}"]`).first().closest('tr').remove()
                    // if (result.bot_protect || result.response == false) {
                    //     location.reload()
                    // }
                    if (result.response) {
                        $('[id^="sendResourceButton-').first().focus()
                        $('#TotalWoodSend').html(
                            Format.number(
                                parseInt($('#TotalWoodSend').text().match(/\d+/g).join('')) + wood
                            ) + '<span class="icon header wood">'
                        )
                        $('#TotalStoneSend').html(
                            Format.number(
                                parseInt($('#TotalStoneSend').text().match(/\d+/g).join('')) + stone
                            ) + '<span class="icon header stone">')
                        $('#TotalIronSend').html(
                            Format.number(
                                parseInt($('#TotalIronSend').text().match(/\d+/g).join('')) + iron
                            ) + '<span class="icon header iron">'
                        )
                        UI.SuccessMessage(result.response.message);
                        updateProgressBar();
                    }
                    if (result.error) {
                        UI.ErrorMessage(result.error.join(','));
                    }
                }
            });
        }

        function getTable() {
            return `<div id="sendResourcesToVillage" style="border: 1px solid #7d510f; margin-bottom: 5px;">
            <div id="SendResourcesToVillageProgessbar" class="progress-bar live-progress-bar progress-bar-alive">
                <div></div>
                <span class="label"></span>
            </div>
            <table id="tableSend" class="vis overview_table" style="width:100%;">
                <thead>
                    <tr>
                        <th colspan="6" style="text-align:center">Envoi de ressources</th>
                    </tr>
                    <tr>
                        <th colspan="2" style="text-align:center">Total de ressources pouvant être envoyés</th>
                        <th id="TotalWoodSend" style="text-align:center">0<span class="icon header wood"> </span></th>
                        <th id="TotalStoneSend" style="text-align:center">0<span class="icon header stone"> </span></th>
                        <th id="TotalIronSend" style="text-align:center">0<span class="icon header iron"> </span></th>
                        <th style="text-align:center"></th>
                    </tr>
                    <tr>
                        <th width="25%" style="text-align:center">Origine</th>
                        <th width="25%" style="text-align:center">Destination</th>
                        <th width="10%" style="text-align:center">Bois</th>
                        <th width="10%" style="text-align:center">Argile</th>
                        <th width="10%" style="text-align:center">Fer</th>
                        <th width="15%">
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
            </div>`
        }

        function getTableRow(village, targetVillage, calculateResources) {
            return `
        <tr class="row_marker row_a" height="40">
            <td style="text-align:center">
                <a href="${game_data.link_base_pure}info_village&id=${village.id}">
                    ${village.name}
                </a>
            </td>
            <td style="text-align:center">
                <a href="${game_data.link_base_pure}info_village&id=${targetVillage.id}"
               data-toggle="tooltip">
                    ${targetVillage.name}
                </a>
            </td>
            <td width="50" style="text-align:center">${Format.number(calculateResources[0])}<span class="icon header wood"> </span></td>
            <td width="50" style="text-align:center">${Format.number(calculateResources[1])}<span class="icon header stone"> </span></td>
            <td width="50" style="text-align:center">${Format.number(calculateResources[2])}<span class="icon header iron"> </span></td>
            <td style="text-align:center"><input type="button" class="btn evt-confirm-btn btn-confirm-yes"
                                                 id="sendResourceButton-${village.id}"
                                                 value="Envoyer les ressources">
            </td>
        </tr>
    `
        }

        function loadTwAjax() {
            if (typeof window.$.twAjax === 'undefined') {
                window.$.twAjax = (function () {
                    let Ajax = function (options, promise) {
                        this.options = options;
                        this.promise = promise;
                    };

                    let Queue = (() => {
                        let Queue = function () {
                            this.list = [];
                            this.working = false;
                            this.length = 0;
                        };

                        Queue.prototype.doNext = function () {
                            let item = this.dequeue(),
                                self = this;

                            $.ajax(item.options).done(function () {
                                item.promise.resolve.apply(null, arguments);
                                self.start();
                            }).fail(function () {
                                item.promise.reject.apply(null, arguments);
                                self.start();
                            });
                        };

                        Queue.prototype.start = function () {
                            if (this.length) {
                                this.working = true;
                                this.doNext();
                            } else {
                                this.working = false;
                            }
                        };

                        Queue.prototype.dequeue = function () {
                            this.length -= 1;
                            return this.list.shift();
                        };

                        Queue.prototype.enqueue = function (item) {
                            this.list.push(item);
                            this.length += 1;

                            if (!this.working) {
                                this.start();
                            }
                        };

                        return Queue;
                    })();

                    let orchestrator = (() => {
                        // Create 5 queues to distribute requests on
                        let queues = (() => {
                            const needed = 5;
                            let arr = [];

                            for (let i = 0; i < needed; i++) {
                                arr[i] = new Queue();
                            }

                            return arr;
                        })();

                        return (item) => {
                            let leastBusyQueue = queues.map(q => q.length).reduce((next, curr) => (curr < next) ? curr : next, 0);
                            queues[leastBusyQueue].enqueue(item);
                        };
                    })();

                    return function (options) {
                        let promise = $.Deferred(),
                            item = new Ajax(options, promise);

                        orchestrator(item);

                        return promise;
                    };
                })();
            }
        }
    }
} catch (message) {
    UI.ErrorMessage(`error: ${message}`)
}