'use strict';

var organizationId_musicAndArts = "1b38ed92-5076-4166-97c0-1cba4ebbbb30";
var organizationId_steelBarCompany = "ae4623bb-adad-4d05-9d64-1e09a7d5940c";
var organizationId_musicLife = "e881aded-23b6-43d8-b53f-01868a9cc42a";
var organizationId_smartPart = "da6f354c-36a6-44cb-9b4a-0d86bbb59f94";
var partnerCompanyId_musicLifeMusicAndArts = "716e4d72-37c4-4238-a880-101b5aa4a9bc";
var partnerCompanyId_repairShopMusicAndArts = "450d8fcf-a030-4363-a14c-6714570cba1f";
var partnerCompanyId_repairShopMusicLife = "230fbb5d-f42f-4521-8f28-1e2837f694b9";
var roleId_superAdmin = "1cfbf042-251e-4dfb-8c77-0eeebb17f951";
var roleId_admin = "5103fd56-1642-4154-87e9-efbe41254e89";
var roleId_account = "040897fb-b9f4-45e1-9919-c532c5ed5d85";
var userId_dev = "25a16f5f-53ed-4d0c-b161-99bcb94159e8";
var userId_zapf = "10153f38-96c8-4b99-9580-292a80ab06db";
var userId_greenberg = "dc5f0121-93be-457f-aad6-380d79e5857e";
var userId_vazquez = "3c9572fc-a542-4db7-bd01-50f09a5e11da";
var userId_baluta = "c06bbd41-fe24-4d49-b948-1fe30f6091dd";
var userId_wiegand = "6bd6963d-a6e3-4f15-8025-837e5a78069a";
var userId_jussila = "74b259dd-4f0b-4aed-87bc-c6685c525391";
var userId_jverne = "ad19ba28-31ec-4085-9a6a-cb62e9d718dc";
var userId_jreeses = "c5c76b44-e2cc-40db-ae3b-032c054adbb2";
var userId_jsteel = "65de514d-5178-4cd4-b4eb-351eeead5ef4";
var userId_account = "d3686744-0438-4db1-8177-2a3d9765e33b";
var userId_admin = "50005dff-8178-4fd8-9c64-78f736cc664d";
var userId_superAdmin = "9e4a2da3-d505-4452-8106-6caf1fb2b1ca";
var userId_spuser = "4e69dfad-c924-49e9-b253-ebd847ba08ec";
var userId_spadmin = "175be85f-df6a-4ba8-be20-d7a6fd62c0ab";
var userId_spmaster = "84985c3c-c051-4aac-91ab-e4219498f9eb";
var categoryId_piano = "2c227c7b-dc9b-4064-ae12-23980fa6f423";
var categoryId_guitar = "3ddaaeb1-9bf0-4107-b473-8563d3158224";
var categoryId_electric = "e1589a96-c8f8-4980-8a8f-ec25e00ef88d";
var categoryId_violin = "9cea8958-ea18-402e-8542-c7146c8ba180";
var categoryId_trombone = "cbcafce5-8661-4474-a32b-3343889b8589";
var itemId_epiphone = "1f2281c5-121d-4d0d-83f6-c12c38933188";
var itemId_stradivarious = "9d529d9e-6013-4f86-aaa3-bafae3788879";
var sectionId_stringDetails = "766ebcdb-195a-46ea-b5a4-21bb028bd3ef";
var sectionId_constructionDetails = "60fcfdd2-abce-4cb4-9920-a87cebf4386e";
var customFieldId_color = "6e59228b-9e90-47d6-8698-b28c51823a31";
var customFieldId_constructionDate = "8c22bcb0-15fc-4448-a031-33d60ad85a68";
var customFieldId_handedness = "a2dcdfd9-41db-4de8-92cc-e68d62adb4d0";
var customFieldId_careInstructions = "e7ddd3b0-7318-406c-82b8-1f9e8eb39351";
var customFieldId_stringCount = "4dfe2deb-245e-4d5c-bc6d-6a6918bcbccf";
var customFieldId_stringMaterial = "a8f4e5a8-55c8-4445-9928-3e5a24fb8ea9";
var customFieldId_brand = "fa68bef1-fa0f-46a8-8796-bae2e9ba38f7";
var customFieldId_model = "4aa00aea-ce1a-4dfa-aafc-7a8aeb75ab8c";
var customFieldId_instrumentNumber = "9280e705-ec47-45c9-b4b3-1bcb7d0e3c27";
var customFieldId_priceLevel = "0a3f9d27-5f36-481e-9981-8ce5a6b57f39";
var customFieldId_stockCode = "1160371f-cae9-4646-b99f-9d518355d3fc";
var customFieldId_price = "0c556acf-7794-48d9-b37b-931dc496ef9e";
var publicUserId_jverneProfile = "f932e2e9-2cd9-4a18-a7ae-e16ee37c499f";
var publicUserId_jreesesProfile = "db615b09-f55b-4168-97e4-79f9cc13ae9e";
var customerId_jverneTempo = "91e6405c-c01e-4592-a3a5-46caa2c1eeae";
var customerId_jverneMusicAndArts = "e54aabae-ed70-45fc-b920-4d3f8ec112e9";
var customerId_rfinkMusicAndArts = "a92c35c0-dc1f-4e08-ba75-255865aa2b33";
var statusId_smartPartDefault = [
  "09797f5c-9531-46d8-8b22-ab4376c23155",
  "2845ad78-68fd-4127-af72-551935fb8547",
  "111e10a9-f84d-4716-a03d-9873779f2a69",
  "3c4e0940-8af6-4b0d-b06e-df2860024a87",
  "33eb6b83-6a6e-4294-a783-5af3a31ce9c9",
  "5b50a66e-059c-472a-8d97-2d5e36f975fc",
  "2f028d08-b8f4-4bd1-b7be-f17d7243e4a8",
  "2f555628-72dc-4ba1-8cb7-a58131b1127e",
  "af9a3841-ff76-468d-883d-2d2ac90e5e19",
  "073d52d6-4a32-4ca0-b5a5-4a79304b8af6",
  "9d91d0d4-a874-4650-bc4e-c673037d3f8b",
  "a5ea7b38-4368-4cd9-962e-a4b3461dd600",
  "b020e334-f87d-4846-9029-6f5a8a16f470",
  "99fbbb12-a010-4b4a-9671-5321082ec1a6",
  "b1ec5a54-4a9a-4dca-8222-e06dc2d2ad67",
  "c5d6203b-ae44-4c69-a6c9-dcfbd9cb31c0",
  "5a6dd4d6-df0d-4bb9-b1cc-345db1056410",
  "7a011c02-7618-4b67-bb00-363e9727d4bc",
  "96706ac4-3fd8-440f-af4a-87f9101baab6",
  "c0fb260e-6158-4315-81ba-4a4878b32bd2"
];
var statusId_musicLifeDefault = [
  "52012192-192a-4d38-9a89-333287a2968a",
  "88de77fc-ce4e-4649-8447-08b27e9a0990",
  "99457fae-c4f2-4dc9-83d0-4ee64750b3ca",
  "b68b8330-2737-4e29-8986-9da65b34a1d3",
  "4bfda66f-1418-4657-ba13-0265506b31f6",
  "8d595903-41af-44a5-88f3-42843aac2ce5",
  "5d55d659-3d60-425a-b26d-bd690b5d99eb",
  "02a54e6d-7238-41be-8bbe-83eab6396c8f",
  "088dc170-e04f-4a4e-9ab5-f94844071037",
  "49edf54c-0882-4f0d-b070-e5b5ea65d9c9"
];
var statusId_musicAndArts = [
  "6032fc30-0f32-49d9-937b-4a5cadc0e405",
  "2c9d484a-505e-47e9-8a74-d93a58d831f9",
  "e1578923-dd51-45b6-908e-dbd441bf9f3f",
  "e22cbe7f-8870-4570-8b4d-9fed1d2c1c5a",
  "6eeff62e-2599-4818-b586-22e728e731e6",
  "55d1d255-6745-40b6-a0a8-d4aedb448660",
  "072870e6-5788-4ae5-9685-96cea645ac8a",
  "97d722d4-13b6-41b3-b181-51ad282f2dce",
  "4af7a213-ccee-45ea-9994-779319657193",
  "052ad595-72de-4248-88b7-dfca4082c744"
];
var statusId_steelBarCompany = [
  "63447d05-4665-4206-864e-ad62eb393eaa",
  "aad5ac89-fece-49b1-a42e-971e8bfb6815",
  "73b54b3c-2dc9-4078-85d5-e453489b1f5b",
  "00269a35-996a-4f32-a426-e4a27aaa3ece",
  "1e9c3527-2dfc-4ff7-8f50-6b8b16e88a37",
  "3d3636fc-79b2-4efd-aff8-85f694eac1ee",
  "b35f9d7a-4e3a-4ddd-8612-e41b3c0a3ac1",
  "9b738650-6127-4dec-8cb2-067211860fb5",
  "af294383-a400-4308-aa11-095778fbca8e",
  "51bc363e-323f-4af7-baf8-9007b664c379",
  "2080caea-ca05-46f8-9118-bfea086d8b79",
  "b5e2707a-6893-4024-9a18-441ac7024bda",
  "c2509f35-39db-4383-ad5e-37b2734565fa",
  "199ba425-3a31-40b3-8dd7-fcc902ae5d4e",
  "348676a0-b706-4d40-b7f0-1a0dbd2830aa",
  "ff98d334-566a-4565-8558-ac9cc2e4e4a3",
  "afd61f58-8fde-4d4a-a185-cacd56352c87",
  "e316956c-a20a-4fab-99ba-7cafd916830b",
  "581ffa25-ddb0-40e2-9c46-c4a626dd449c",
  "74526b76-2c25-4480-a99f-6055ec69a750"
];
var statusId_musicLifeOrg = [
  "cb05d712-8d2e-4fbf-af66-617cc7af0667",
  "c94adb43-9c5f-45c6-8933-2050e87ffd13",
  "aa412da3-31a3-419d-8670-24c764557d4f",
  "25c33667-a9cf-4ad1-a1fd-6470d441582c",
  "70481655-97b8-4128-afd4-190979654eab",
  "bb2fe4db-df20-4880-a2e9-4997cfa2d3d6",
  "dfaa75aa-e679-44e0-a3d1-49612839a744",
  "3fe1336f-cd32-4bbd-95dd-9b54e70f4706",
  "375e7e29-78bf-4f42-988d-386b5aa33612",
  "bb35826f-bf72-4e76-88c4-5f87a3cc9afb"
];
var statusId_smartPartOrg = [
  "b7d00084-f32b-48b7-8ad1-4ad4a4e2bf86",
  "13372dcf-79da-4611-b5f9-c65c26998e2b",
  "e2118c0f-ae3c-4356-a7aa-c4e039068cd6",
  "29505c9e-5a7e-46b8-811c-726254646d30",
  "788b863e-aba7-42de-ac67-a5c572d76a4c",
  "8857ca2a-6a3c-45fe-8b2d-05fe00244457",
  "22ff2179-ff91-4a00-83a2-4a1c4a6c65c4",
  "7c47cb72-d3d5-422e-b828-a9ec0e27c7fb",
  "c40db02b-1ea4-4dc9-8dec-1b258efbd7f2",
  "9980d45e-a966-42c4-b584-e35d7e26ccaa",
  "ed77fdbe-6522-4eeb-aac2-8102a006c16c",
  "307114c5-1d6c-4de8-ae9e-b4c8c21a11ba",
  "e4cb3d99-ee03-4927-a172-c50ac59663a5",
  "8179f2e4-43b1-485a-98fc-bb98fa142f50",
  "bbffd780-00aa-4359-a4dc-48582124267e",
  "d72f4877-2942-4b49-ab59-aab40693673b",
  "a0d43339-5856-463b-90bd-0027746260a6",
  "fa74ae1e-9a43-4e9f-bf6b-8fb19ba9eee7",
  "2d37e2b5-548f-46d6-aaf9-e8d3d0f774f2",
  "8ba648a7-75b4-4dd5-be93-da08930172d7"
];
var locationId_musicLifeOrg = [
  "edb4a4f2-baf4-4908-8914-eb7e457fb04f",
  "82a5dcaa-ac1f-4ce2-bc15-7dc221a8374c",
  "e9e6fa39-53ed-4271-9fae-0b14b46d87a4"
];
var locationId_smartPartOrg = [
  "dc6d61d4-8b78-4495-95cf-e0819285d792",
  "d2eba7cb-5994-458a-88ae-4e2306df7a49",
  "b553514c-b894-4711-bc8f-835b3296cc40"
];
var locationId_musicAndArts = [
  "0bec2759-4303-4e49-b50d-6a876719ef56",
  "ece1f4a2-2788-45e5-9e18-ce8ff76c5231",
  "c315e8f9-d2a1-42c3-89db-90a67127fbeb"

];
var locationId_steelBarCompany = [
  "3557fe18-ac8b-45aa-b5d9-7beddfabda32",
  "d5840489-6ca7-4b1e-8f72-aa6961c64512",
  "6d14dc32-e1b3-4cc0-85b3-97743b8dddbc"
];
var noteId_epiphone = "14d1bbed-ea0a-4174-828c-48a8a603bfb5";
var noteId_stradivarious = "3e6cff8f-cd5b-4b8d-9471-5a9e35a01081";


module.exports = {
  up: function (queryInterface, Sequelize) {
    console.log("SEEDING");

    console.log("Seeding Roles");
    return queryInterface.bulkInsert('role', [
      {
        id: roleId_superAdmin,
        name: "SuperAdmin",
        description: "A chief administrator of the app",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: roleId_admin,
        name: "Admin",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: roleId_account,
        name: "Account",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]).then(function (result) {
      console.log("Seeding Users");
      var passwordUtility = require('../../api/utilities/password');
      var hashedPassword = passwordUtility.hash_password("devdev");
      return queryInterface.bulkInsert('user', [
        {
          id: userId_account,
          firstName: "Test",
          lastName: "Account",
          "password": hashedPassword,
          "email": "account@scalioframe.com",
          roleId: roleId_account,
          accountActivated: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: userId_admin,
          firstName: "Test",
          lastName: "Admin",
          "password": hashedPassword,
          "email": "admin@scalioframe.com",
          roleId: roleId_admin,
          accountActivated: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: userId_superAdmin,
          firstName: "Test",
          lastName: "SuperAdmin",
          "password": hashedPassword,
          "email": "super-admin@scalioframe.com",
          roleId: roleId_superAdmin,
          accountActivated: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
    })
  },

  down: function (queryInterface, Sequelize) {
    console.log("Deleting Roles");
    return queryInterface.bulkDelete('role', {
      id: [
        roleId_superAdmin,
        roleId_admin,
        roleId_account
      ]
    }).then(function (result) {
      console.log("Deleting Users");
      return queryInterface.bulkDelete('user', {
        id: [
          userId_account,
          userId_admin,
          userId_superAdmin,
        ]
      })
    })
  }
};
