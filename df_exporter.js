(function () {
    function matmult(mat1, mat2) {
        var res =
            [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ];

        let i, j, k;
        var N = 4;
        for (i = 0; i < N; i++) {
            for (j = 0; j < N; j++) {
                res[i][j] = 0;
                for (k = 0; k < N; k++)
                    res[i][j] += mat1[i][k] * mat2[k][j];
            }
        }
        return res;
    }

    function matadd(mat1, mat2) {
        var res =
            [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ];

        let i, j, k;
        var N = 4;
        for (i = 0; i < N; i++) {
            for (j = 0; j < N; j++) {
                res[i][j] = mat1[i][j] + mat2[i][j];
            }
        }
        return res;
    }

    function transformToMatrix(location, rotation, size, inflate, scale, origin) {
        rotation[0] = Math.degToRad(rotation[0]).toFixed(2);
        rotation[1] = Math.degToRad(rotation[1]).toFixed(2);
        rotation[2] = Math.degToRad(rotation[2]).toFixed(2);

        var xrotmat =
            [
                [1, 0, 0, 0],
                [0, Math.cos(rotation[0]), -Math.sin(rotation[0]), 0],
                [0, Math.sin(rotation[0]), Math.cos(rotation[0]), 0],
                [0, 0, 0, 1]
            ];

        var yrotmat =
            [
                [Math.cos(rotation[1]), 0, Math.sin(rotation[1]), 0],
                [0, 1, 0, 0],
                [-Math.sin(rotation[1]), 0, Math.cos(rotation[1]), 0],
                [0, 0, 0, 1]
            ];

        var zrotmat =
            [
                [Math.cos(rotation[2]), -Math.sin(rotation[2]), 0, 0],
                [Math.sin(rotation[2]), Math.cos(rotation[2]), 0, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 1]
            ];

        var translationMatrix =
            [
                [1, 0, 0, location[0] - inflate],
                [0, 1, 0, location[1] - inflate],
                [0, 0, 1, location[2] - inflate],
                [0, 0, 0, scale]
            ];

        var scaleMatrix =
            [
                [size[0] + inflate * 2, 0, 0, 1],
                [0, size[1] + inflate * 2, 0, 1],
                [0, 0, size[2] + inflate * 2, 1],
                [0, 0, 0, 1],
            ];

        var pivotMatrix =
            [
                [1, 0, 0, origin[0] - location[0] + 1],
                [0, 1, 0, origin[1] - location[1] + 1],
                [0, 0, 1, origin[2] - location[2] + 1],
                [0, 0, 0, 1]
            ]

        var rotationMatrix = matmult(matmult(pivotMatrix, matmult(matmult(xrotmat, yrotmat), zrotmat)), matrix_invert(pivotMatrix));
        var transformMatrix = matmult(matmult(translationMatrix, rotationMatrix), scaleMatrix);

        offset = -1;
        transformMatrix = matadd(transformMatrix, [[0, 0, 0, offset], [0, 0, 0, offset], [0, 0, 0, offset], [0, 0, 0, 0]]);

        rotation[0] = rotation[0] * (180 / Math.PI);
        rotation[1] = rotation[1] * (180 / Math.PI);
        rotation[2] = rotation[2] * (180 / Math.PI);

        return transformMatrix;
    }

    function matrix_invert(M) {
        if (M.length !== M[0].length) { return; }

        var i = 0, ii = 0, j = 0, dim = M.length, e = 0, t = 0;
        var I = [], C = [];
        for (i = 0; i < dim; i += 1) {
            I[I.length] = [];
            C[C.length] = [];
            for (j = 0; j < dim; j += 1) {

                if (i == j) { I[i][j] = 1; }
                else { I[i][j] = 0; }

                C[i][j] = M[i][j];
            }
        }

        for (i = 0; i < dim; i += 1) {
            e = C[i][i];

            if (e == 0) {

                for (ii = i + 1; ii < dim; ii += 1) {
                    if (C[ii][i] != 0) {
                        for (j = 0; j < dim; j++) {
                            e = C[i][j];       //temp store i'th row
                            C[i][j] = C[ii][j];//replace i'th row by ii'th
                            C[ii][j] = e;      //repace ii'th by temp
                            e = I[i][j];       //temp store i'th row
                            I[i][j] = I[ii][j];//replace i'th row by ii'th
                            I[ii][j] = e;      //repace ii'th by temp
                        }
                        break;
                    }
                }
                e = C[i][i];
                if (e == 0) { return }
            }

            for (j = 0; j < dim; j++) {
                C[i][j] = C[i][j] / e; //apply to original matrix
                I[i][j] = I[i][j] / e; //apply to identity
            }


            for (ii = 0; ii < dim; ii++) {
                if (ii == i) { continue; }

                e = C[ii][i];

                for (j = 0; j < dim; j++) {
                    C[ii][j] -= e * C[i][j]; //apply to original matrix
                    I[ii][j] -= e * I[i][j]; //apply to identity
                }
            }
        }

        //C identity
        //I inverse
        return I;
    }

    function matrixString(matrix) {
        var r = "";
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                r += Number(Number(matrix[i][j]).toFixed(2));
                if (Number(Number(matrix[i][j]).toFixed(2)) == 0) {
                    r = r.slice(0, -1);
                }
                r += "/";
            }
        }
        return r.substring(0, r.length - 1);
    }

    function addObjects(objects, scale, groupMat = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, scale]]) {
        let displayString = "";

        for (let i = 0; i < objects.length; i++) {
            var element = objects[i];

            let matstring;

            if (element.type == "group") {
                let groupMat2 = transformToMatrix([0, 0, 0], element.rotation, [1, 1, 1], 0, 1, element.origin);
                displayString += addObjects(element.children, scale, matadd(matmult(groupMat, groupMat2), [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]));
                displayString += " ";
                continue;
            }
            else {
                cubeMat = transformToMatrix(element.from, element.rotation, element.size(), element.inflate, 1, element.origin);
                matstring = matrixString(matmult(groupMat, cubeMat));
            }

            var blockid;
            var blocktags;

            if (String(element.name).includes("[")) {
                blockid = String(element.name).split("[")[0];
                blocktags = String(element.name).split("[")[1].replace("]", "");
            }
            else {
                blockid = element.name;
                blocktags = "";
            }
            displayString += matstring + "/" + blockid + "/" + blocktags + " ";
        }
        return displayString.substring(0, displayString.length - 1);
    }

    function getDisplays(modelname, scale, includebase, includehelper) {
        var blocks = [{
            "id": "block",
            "block": "func",
            "args": {
                "items": [
                    {
                        "slot": 0, "item": {
                            "id": "pn_el",
                            "data": { "name": "location", "type": "loc", "plural": false, "optional": false, "description": "Location to display at." }
                        }
                    },
                    {
                        "slot": 25, "item": {
                            "id": "hint",
                            "data": { "id": "function" }
                        }
                    },
                    {
                        "slot": 26, "item": {
                            "id": "bl_tag",
                            "data": { "option": "False", "tag": "Is Hidden", "action": "dynamic", "block": "func" }
                        }
                    }
                ]
            },
            "data": "bbm." + modelname
        }];


        var displayString = "";

        displayString = addObjects(Outliner.root, scale);

        //TODO: this part is for splitting the string into multiple strings of < 5000 characters to avoid the string size limit on DF
        //the string size limit gets even worse with the animations if you are moving a large amount of cubes since all of them need individual matrices per keyframe.

        // const substringMaxLength = 5000;
        // const regex = new RegExp(`\\b\\w(?:[\\w\\s]{${substringMaxLength - 1},}?(?=\\s)|.*$)`, 'g');
        // const substrings = displayString.match(regex);

        if (displayString.length > 5000) {
            let options =
            {
                title: "Exporting Error",
                icon: "error",
                message: "Failed to export templates. \n\rModel animation too big/complex, string length > 5000. \n\rWill still export but may be broken.",
                width: 600
            }

            Blockbench.showMessageBox(options);
        }

        var args = [
            {
                "slot": 0, "item": {
                    "id": "var",
                    "data": { "name": "location", "scope": "line" }
                }
            },
            {
                "slot": 1, "item": {
                    "id": "var",
                    "data": { "name": "bbm." + modelname, "scope": "unsaved" }
                }
            },
            {
                "slot": 2, "item": {
                    "id": "txt",
                    "data": { "name": displayString }
                }
            }
        ];

        blocks.push({
            "id": "block",
            "block": "call_func",
            "args": { "items": args },
            "data": "displayblock"
        });


        var data = JSON.stringify({ "blocks": blocks });

        var displayfuncPacket = {
            "type": "template",
            "data": JSON.stringify({
                "data": 'H4sIAAAAAAAA/91X227bMAz9FUHPAbYWWAfkrUvarVg7FGu6l6EIFJtxhMqSIdFrgyL/PvqWOHYuzsXpsKdEskgeHh5R0hsfKeM9O979/calz7vZmHfy3y4fx9qjobABLaI1CGG+mv6lM4lVpIegaJkvUCSTWoRA0+SDJnEaLQaRiq1QvDsWykGHmwil0fOJ2azDnTLIux9nnWYxQuODeny86btFqD/Cbg1FjsB5VqazZCOYBYytZmQsxUgB84xGIbXUAcMJsDQQi2PpO4aGjYDFDnw2NpYJLUOR+lkkcNY0gbwCc/D4ijvwdF4LM5EaS1HSuaSKFXznn2qWIzVEEZRsTUHOdRI0gUifu/zGsW/S90EnwvDyJf6U8pFeVTqlgBezp1nhm/vSRUpMs7UpklXqc4DDrJhbBJgt2iQN55lMhlIDL+ssATXPomdBINxKh22Bmpd7LaBqWfZyU5dfpquKG1Yu0DIVD5GS+ICW9L+eCwsREbYnFenw9ESsl/nAxguVXyplXlgiBdabCB2AK8v92tgr4U3qVNQEXzNZkGmF9wxpVaQFj0wISrqr8lZQuGxHiUehf7OThir8cKAKj7Ajh/T91FzoOKw7Ofu8nox7EyV6/CUU6bRVNhxSGzy8S/0XjNDRbuXrUY+Qg9qm3KUsqxm9WKrCEvy7WKGMFPwzbcoDpU4uxF2Jr8jyK2DrstzGy/I+EdbBjzgcgX2/bdKI5M1pVcR6GZEQ/SrNdb16ymT312aCDQjKMA+yHxnZY+cIN5uN51JD3TZr6bWDV7zoL4lln67q73tFr2YZUMTySyova+Invb7ZAJKq3wqHVxolTndVUCVHSJ2cVBFN32LfASLWi60ljOynQVFALBIcgILIWFybzvoLa8l0Jadt0rXjodvPnpN3hVWbeFcfqZuxDe779J7P/W8G17h7Pc3+Atqs8+C/EQAA',
                "name": "§b§lDisplay function"
            }),
            "source": "Blockbench"
        };

        let helperfuncPackets = [
            {
                "type": "template",
                "data": JSON.stringify({
                    "data": 'H4sIAAAAAAAA/51STW/CMAz9K1HOPQyk7dAj2tA4bAc2TtOE0sSUbGlSJe4mhPrf55QyykcBcWr9YvvZz2/NM+Pkd+Dpx5prxdNNzJP2m/JFZSWFwueURDkIRZtNfw0Sq0o7B0NpSqCIoBUFEFw4BWY2mzwGesNVGbEf4SkoTeWF4elCmAAJdyVqZzuAgiC9blCqEcwDVt4yKtYiM8Cksyi01TZnuATWELGq0iowdCwDVgVQbOE8E1YXoulT1wkPxiFP7+rkugVKjXK5m91WxcXZdyyDa1lW4vdWjuERx1Jb7FA0WDzigQTD+6PKzMxR5J1at9V/HEnjiPSc8klgz1opsNEXsk1RK1pGy0PndAgf6s9625u/AY5GL1OH7WmSHvsFMCBx7rKvyybcOOucBYN0jcZGWzhrh34p3n3VUSK3zgMbO08WQzJjV5EnixpXr3GMk/scSXOqslcYaHLmbc1t2mzdfbUsJ7ts3NvTY7C/GZ39/+ZRRJ8DNnBU5XYj7HFMIVBT4v0DcTwV+d0EAAA=',
                    "name": "§b§lFunction §3» §bSetBBMRotation"
                }),
                "source": "Blockbench"
            },
            {
                "type": "template",
                "data": JSON.stringify({
                    "data": 'H4sIAAAAAAAA/61S0U7CMBT9labPe1ATfdgjKpEYjUF4Mmbp1suodu3S3pkQsn/3dhs4gYEhPkHP7uk59/Sseapt9ul5/LbmSvK4PfOo+435ojIZHYXLaYhmEIpumv41SGCVJgFNY1KgCKARBRBcWAl6Pp/cefqGqzJgX8LRodSVE5rHC6E9RNyWqKzpARJ85lSDEkcwB1g5w4isRKqBZdagUEaZnOESWCPEqkpJz9CyFFjlQbKFdUwYVYjmnrqOuNcWeXxRR39bgEJouVv7hJy0/yN0uSe0VAZ7Og0WMt5xeHW9x0x1giLvce0mnnEQDRbpc8wnnj0oKSGYFlk3Ile0kcp2H7YneFO/15u7+SvgaPT0Yr1qfUUD7fCgIcPEph+nO9I+/LGG+My2GSsDR19rOIqZq3pJ5MY6YGPrqAFIXekncm9Q4eo52Di4z140h5iDwUAzk3Sc87Lple+/k3kEKNlt5Rz5ZFOLG53tjjMKorQOB1cajqdHRVobsOlTyPX8Kv0SmIKnS0n0Gw4cklC+BAAA',
                    "name": "§b§lFunction §3» §bSetBBMPosition"
                }),
                "source": "Blockbench"
            }
        ];

        var displaydataPacket = {
            "type": "raw_template",
            "data": JSON.stringify({
                "data": data,
                "name": "§b§lFunction §3» §bbbm." + modelname
            }),
            "source": "Blockbench"
        };

        let packets = [displaydataPacket];
        if (includebase) {
            packets.push(displayfuncPacket);
        }
        if (includehelper) {
            packets = packets.concat(helperfuncPackets);
        }
        return packets;
    }

    function getAnimations(modelname, scale, includedebase) {
        let packets = [];

        for (const animation of Animation.all) {
            let frameCount = 0;
            let timelinepos = [];

            let groups = [];

            for (const id in animation.animators) {

                const boneAnimator = animation.animators[id];
                if (!(boneAnimator instanceof BoneAnimator)) continue;


                if (boneAnimator.keyframes.length == 0) {
                    continue;
                }

                let posKeyArray = [];
                let posArray = [];
                let rotKeyArray = [];
                let rotArray = [];
                let scaleKeyArray = [];
                let scaleArray = [];


                // Position
                if (boneAnimator.position.length) {
                    //Sorts by time to ensure ordering
                    for (const keyFrame of boneAnimator.position) {
                        posKeyArray.push(keyFrame);
                    }
                    posKeyArray.sort((a, b) => a.time - b.time)

                    for (const keyFrame of posKeyArray) {
                        const { x = 0, y = 0, z = 0 } = keyFrame.data_points[0];
                        posArray.push([x, y, z]);
                    }
                }

                // Rotation
                if (boneAnimator.rotation.length) {
                    for (const keyFrame of boneAnimator.rotation) {
                        rotKeyArray.push(keyFrame);
                    }
                    rotKeyArray.sort((a, b) => a.time - b.time)

                    for (const keyFrame of rotKeyArray) {
                        const { x = 0, y = 0, z = 0 } = keyFrame.data_points[0];
                        rotArray.push([-x, -y, z]);
                    }
                }

                // Scale
                if (boneAnimator.scale.length) {
                    for (const keyFrame of boneAnimator.scale) {
                        scaleKeyArray.push(keyFrame);
                    }
                    scaleKeyArray.sort((a, b) => a.time - b.time)

                    for (const keyFrame of scaleKeyArray) {
                        const { x = 0, y = 0, z = 0 } = keyFrame.data_points[0];
                        scaleArray.push([x, y, z]);
                    }
                }

                frameCount = Math.max(posKeyArray.length, rotKeyArray.length, scaleKeyArray.length);

                [posKeyArray, rotKeyArray, scaleKeyArray][[posKeyArray, rotKeyArray, scaleKeyArray].map(a => a.length).indexOf(Math.max(...[posKeyArray, rotKeyArray, scaleKeyArray].map(a => a.length)))].forEach(key => {
                    timelinepos.push(key.time);
                });

                let group = new cGroup;

                group.children = getcubesfromgroup(boneAnimator.group);
                group.uuid = boneAnimator.group.uuid;

                for (let i = 0; i < frameCount; i++) {
                    let position = parsearray(posArray[i]);
                    let rotation = parsearray(rotArray[i]);
                    let size = parsearray(scaleArray[i]);

                    if (!scaleArray[i]) {
                        size = arradd(parsearray(scaleArray[i]), [1, 1, 1]);
                    }

                    let matrix = transformToMatrix([0, 0, 0], rotation, size, 0, 1, boneAnimator.group.origin);

                    group.matrices.push(matrix);
                    group.offset.push(
                        [
                            [0, 0, 0, -position[0]],
                            [0, 0, 0, position[1]],
                            [0, 0, 0, position[2]],
                            [0, 0, 0, 0]
                        ]
                    );
                }

                groups.push(group);
            }


            let cubeanims = [];

            let cubes = [];
            Outliner.root.forEach(element => {
                if (element.type == "group") {
                    cubes = cubes.concat(getcubesfromgroup(element));
                }
                else {
                    cubes.push(element);
                }
            });

            cubeanims = addObjectAnims(Outliner.root, scale, groups, timelinepos, frameCount);
            cubeanims = cubeanimsToString(cubeanims);
            if (cubeanims.length > 5000) {
                let options =
                {
                    title: "Exporting Error",
                    icon: "error",
                    message: "Failed to export templates. \n\rModel animation too big/complex, string length > 5000. \n\rWill still export but may be broken.",
                    width: 600
                }

                Blockbench.showMessageBox(options);
            }

            var blocks = [{
                "id": "block",
                "block": "func",
                "args": {
                    "items": []
                },
                "data": "bbm." + modelname + "." + animation.name
            }];

            var args = [
                {
                    "slot": 0, "item": {
                        "id": "var",
                        "data": { "name": "bbm." + modelname, "scope": "unsaved" }
                    }
                },
                {
                    "slot": 1, "item": {
                        "id": "txt",
                        "data": { "name": cubeanims }
                    }
                }
            ];

            blocks.push({
                "id": "block",
                "block": "call_func",
                "args": { "items": args },
                "data": "animblock"
            });


            var data = JSON.stringify({ "blocks": blocks });

            var packet = {
                "type": "raw_template",
                "data": JSON.stringify({
                    "data": data,
                    "name": "§b§lFunction §3» §bbbm." + modelname + "." + animation.name
                }),
                "source": "Blockbench"
            };
            packets.push(packet);
        }
        var animfuncpacket = {
            "type": "template",
            "data": JSON.stringify({
                "data": 'H4sIAAAAAAAA/7VVTWvcMBD9K0YQSMCHJtAeDD2VhhQ2vSS0hxKMLE+8k2glIY1LluD/Xn14vc5+eLcbctrVaEYz7z09+ZVVUotnx4o/rwxrVqQ1y/vfgj22Svglt41P8jkEiz7b/4uRUGVUCdKn1Zx4CCq+AB9uW6ydD9PShKVER35lZGu5ZMUjlw5ypg2hVkOg63LmpCZWfOry49pwhQtHFlWz7kUv/9PqcqvVHBWNOsVY4CIcwNaFV5+3KitZEm9Gtamr37kOTcOIfrtgP1x2g3UNKtAr+pR66TGh2BRg1PBL99Ctzo7IU2IcY5eADqj8y+1hDVPSFLVO6F5HBWxKp5OPuozgBjbujES6SzUfBFC0FQjdRrHfh2912Y+DNvNemIFqaL4fmQUDnE4Ehu8GdAQ1G6BuW0loJIwgWS6eIToJLQhf4u0Qr3zv0x7jhLrSl5W6ejrMQ/L8BoozVDW8nEd18jMP9BwvLibJ2G/ge9uO/NsobSG71nbBidK1Hpj4rghp+TOMsBPLlqF3VX6sp/vXeFBWC/8wTvEyRe/a3Ls43rgmXyeQEbdUGqsFOHcY336pvmmzHKSaBWzZL26RVxLc9IP7doQTn/rfSPNMtNaCoizpHjZWA917XEDZra7hxGEOfga2jSekTp+ft8576P4BCEX7/wYIAAA=',
                "name": "§b§lAnimation function"
            }),
            "source": "Blockbench"
        };

        var animprocPacket = {
            "type": "template",
            "data": JSON.stringify({
                "data": 'H4sIAAAAAAAA/81X32vbMBD+V4JgsIJhTQd98Fvp1q6wjkG67WGUoMiHKypLQjpvCZ3/90my3TpxndrNrz7Zlu4+3X33nTg/kJlQ7N6S+PcD4QmJy28SVc+YaKMYWOtWqEmdnTNDyCoH9xZWSscp0tTZJRSpX1UauZJu54IKC27Db8fkyo6+8CQB6SFZZZIsJM04e+bcooiIFQpJfHJa3BY1PKGSZ6VtEXWEbgGnf6h5OfTSqI7bRQLVARaN4BbdpmVK+1UHTUUjqONw+pbAxi0wnGMb7F+TlMDJI48TLThO0HCZdvNiQAPFV9LC8hn4bJppcAn7o6RbZzcmf5LZmRDq7+irQx+d31GZgm3q7UKZz5TdtUlpya3l8kSroeweQn24AeZcXChB1rgIudSQu9Hn1grxMlBPXUYb6nIzPjKKtjxgACHP5vGOywTm72teovHRcC4+HJqLdSwshXNunEjBN8qObgw+pCAyz9oI49OlAiyFf50L5FrA2+lLEGLjnuwh5rYQh7K/ostLQK+Cn1TkcChylgL6To2Fb3k2A3OgRul3f67NaUWuZ9pJMVnluK1YJlQ5M+1Dssgz8GFrZbd+eX486iajV4FBIsfFtHLa/X34iVst6OKauv6bh3HCpOBLMgEBpdGOysAlgtFJbrZehJO3UIRe6bVKcRW8lKDVyUPKwZREo8R+u2LNfMr9n1Y9oN44+NEPybE5l/6i4Xs1ge6pNDi84iK5Lf4D1tlEzPsNAAA=',
                "name": "§a§lAnimation process"
            }),
            "source": "Blockbench"
        };

        if (includedebase) {
            packets = packets.concat([animfuncpacket, animprocPacket]);
        }

        return packets;
    }

    function addObjectAnims(objects, scale, groups, timelinepos, frameCount) {
        let cubeAnims = [];

        for (let frame = 0; frame < frameCount; frame++) {
            cubeAnims = cubeAnims.concat(addObjectsAtFrame(objects, scale, frame, groups, timelinepos));
        }
        let cubeAnimsGrouped = [];

        for (let j = 0; j < cubeAnims.length / frameCount; j++) {
            cubeAnimsGrouped[j] = [];
            for (let i = 0; i < frameCount; i++) {
                cubeAnimsGrouped[j].push(cubeAnims[j + (i * (cubeAnims.length / frameCount))]);
            }
        }

        return cubeAnimsGrouped;
    }

    function addObjectsAtFrame(objects, scale, frame, groups, timelinepos, groupMat = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, scale]], offset = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]) {
        let objectFrames = [];

        for (let i = 0; i < objects.length; i++) {
            var element = objects[i];

            let animated = false;
            for (const group of groups) {
                if (group.children.includes(element) || element.uuid === group.uuid) {
                    animated = true;
                    break;
                }
            }

            if (!animated) {
                if (element.type == "cube") {
                    objectFrames.push([[], 0, 0]);
                    continue;
                }
                else {
                    objectFrames = objectFrames.concat(addObjectsAtFrame(element.children, scale, frame, groups, timelinepos));
                    continue;
                }
            }

            if (element.type == "group") {
                animGroup = groups.find(e => e.uuid === element.uuid);
                let groupMat2 = transformToMatrix([0, 0, 0], element.rotation, [1, 1, 1], 0, 1, element.origin);
                objectFrames = objectFrames.concat(addObjectsAtFrame(element.children, scale, frame, groups, timelinepos, matmult(matmult(groupMat, groupMat2), animGroup.matrices[frame]), matadd(offset, animGroup.offset[frame])));
                continue;
            }
            else {
                cubeMat = transformToMatrix(element.from, element.rotation, element.size(), element.inflate, 1, element.origin);
                finalMat = matadd(matmult(groupMat, cubeMat), offset);

                let interpdur = 0;
                if (frame != 0) {
                    interpdur = parseInt((timelinepos[frame] - timelinepos[frame - 1]) * 20);
                }

                if (finalMat.length != 0) {
                    finalMat[3][3] = scale;
                }
                //cant be the exact same matrix twice because then it interpolates weirdly
                objectFrames.push([finalMat, interpdur, interpdur]);
            }
        }
        return objectFrames;
    }

    function arraysEqual(a, b) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (a.length !== b.length) return false;

        for (var i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }

    function cubeanimsToString(cubeanims) {
        let string = "";
        cubeanims.forEach(cube => {
            let prevFrameMat = [];
            cube.forEach(frame => {
                if (frame[0].length != 0) {
                    // if (frame[0] == prevFrameMat) {
                    if (arraysEqual(frame[0].flat(), prevFrameMat.flat())) {
                        frame[0][1][3] += 0.01;
                    }
                    string += matrixString(frame[0]) + "," + frame[1] + "," + frame[2] + "|";
                    prevFrameMat = frame[0];
                }
            });
            if (string.slice(-1) == "|") {
                string = string.slice(0, -1);
            }
            string += " ";
        });
        string = string.slice(0, -1);
        return string;
    }

    function arradd(arr1, arr2) {
        if (arr1.length != arr2.length) {
            console.log("arrays not of equal size!");
            return;
        }
        let resarr = [];
        for (let i = 0; i < arr1.length; i++) {
            resarr[i] = arr1[i] + arr2[i];
        }
        return resarr;
    }

    function parsearray(array) {
        if (!array) {
            return [0, 0, 0];
        }
        for (let i = 0; i < array.length; i++) {
            array[i] = parseFloat(array[i]);
        }
        return array;
    }

    function getcubesfromgroup(group) {
        let cubes = [];
        group.children.forEach(child => {
            if (child.type == "group") {
                cubes = cubes.concat(getcubesfromgroup(child));
            }
            else {
                cubes.push(child);
            }
        });
        return cubes;
    }

    const sleep = ms => new Promise(res => setTimeout(res, ms))

    function sendToRecode(packets) {
        const ws = new WebSocket("ws://localhost:31371");
        ws.onopen = async function () {
            for (const packet of packets) {
                ws.send(JSON.stringify(packet) + "\n");
                await sleep(500);
            }
        }

        var count = 0;
        ws.onmessage = function (event) {
            count++;
            if (count == packets.length) {
                Blockbench.showStatusMessage(JSON.parse(event.data).status, 2000)
                ws.close();
            }
        }

        ws.onerror = function () {
            let options =
            {
                title: "Exporting Error",
                icon: "error",
                message: "Failed to export templates. \n\rEither Minecraft isn't running or you don't have Recode installed.",
                width: 600
            }

            Blockbench.showMessageBox(options);
        }
    }

    class cGroup {
        uuid;
        children = [];
        matrices = [];
        offset = [];
    }

    var exportDialog = new Dialog({
        id: "df_export_options",
        title: "DF model exporter",
        form: {
            modelname: {
                label: "model name",
                description: "the name of the model, this will be used for the function name to spawn it.",
                type: "text",
                value: Project.name
            },
            scale: {
                label: "model scale",
                description: "a scale of 1 means 1 unit is 1 pixel, scale 16 means 1 unit is a full block.",
                type: "number",
                value: 1
            },
            exportanim: {
                label: "export animations",
                description: "exports animations as separate templates.",
                type: "checkbox",
                value: false
            },
            includebase: {
                label: "include base templates",
                description: "base templates are the ones that every model uses to render or animate.",
                type: "checkbox",
                value: true
            },
            includehelper: {
                label: "include helper templates",
                description: "templates to make it easier to move and rotate models.",
                type: "checkbox",
                value: true
            },
            // exportTo: {
            //     label: "Export to",
            //     description: "which method to export with.",
            //     options: {
            //         recode: "Recode",
            //         test2: "CodeClient",
            //         test3: "test3"
            //     },
            //     type: "inline_select"
            // }
        },
        onConfirm: function (formData) {
            this.hide();

            let packets = [];
            let scale = (16 / formData.scale);

            if (formData.modelname.trim() == "") {
                formData.modelname = "model";
            }
            packets = packets.concat(getDisplays(formData.modelname, scale, formData.includebase, formData.includehelper));

            if (formData.exportanim) {
                packets = packets.concat(getAnimations(formData.modelname, scale, formData.includebase));
            }

            sendToRecode(packets);
        }
    });

    var exportActionRecode;
    Plugin.register("df_exporter", {
        title: "DF Model Exporter",
        author: "KingRoboLizard",
        description: "lets you export models to diamondfire.",
        tags: ["Minecraft: Java Edition"],
        icon: "keyboard_capslock",
        version: "0.2.3",
        min_version: "4.8.0",
        variant: "both",
        onload() {
            exportActionRecode = new Action("df_exporter", {
                name: "Export to recode",
                category: "file",
                description: "Export model as a DF template",
                icon: "fa-file-export",
                click() {
                    exportDialog.show();
                }
            });

            MenuBar.addAction(exportActionRecode, "file.export");
        },
        onunload() {
            exportActionRecode.delete();
        }
    });
})()
