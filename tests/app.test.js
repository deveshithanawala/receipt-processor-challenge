const { expect } = require('chai');
const supertest = require('supertest');
const app = require('../app'); 
const request = supertest(app);


describe('POST/receipts/process',()=>{
    it('successfully processes a receipt and returns an id ', ()=> {
        const receiptData = {
            retailer: 'Sample Retailer',
            purchaseDate: '2023-09-15',
            purchaseTime: '15:30',
            items: [
              {
                shortDescription: 'Item 1',
                price: '10.99',
              },
            ],
            total: '10.99',
          };
      
          request.post('/receipts/process')
                 .send(receiptData)
                 .expect(200)
                 .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.have.property('id');
                    expect(res.body.id).to.be.a('string');
            
            });
     });
     it('should return a 400 status code for Invalid Purchase Date', ()=> {
        const receiptData = {
            retailer: 'Sample Retailer',
            purchaseDate: '2023-23-15',
            purchaseTime: '15:30',
            items: [
              {
                shortDescription: 'Item 1',
                price: '10.99',
              },
            ],
            total: '10.99',
          };
      
          request.post('/receipts/process')
                 .send(receiptData)
                 .expect(400)
                 .end((err, res) => {
                    expect(res.body).to.have.property('error', 'Invalid purchaseDate format');       
            });
     });
     it('should return a 400 status code for Invalid Purchase Time', ()=> {
        const receiptData = {
            retailer: 'Sample Retailer',
            purchaseDate: '2023-02-15',
            purchaseTime: '25:30',
            items: [
              {
                shortDescription: 'Item 1',
                price: '10.99',
              },
            ],
            total: '10.99',
          };
      
          request.post('/receipts/process')
                 .send(receiptData)
                 .expect(400)
                 .end((err, res) => {
                    expect(res.body).to.have.property('error', 'Invalid purchaseTime format');       
            });
     });
});

describe('GET/receipts/:id/points',()=>{
   it('should return the points for a valid receipt ID', async() => {

            const receiptData = {
                retailer: 'Sample Retailer',
                purchaseDate: '2023-09-15',
                purchaseTime: '15:30',
                items: [
                  {
                    shortDescription: 'Item 1',
                    price: '10.99',
                  },
                ],
                total: '10.99',
              };
          
              const postResponse = await request.post('/receipts/process').send(receiptData);
              expect(postResponse.status).to.equal(200);

              const receiptId = postResponse.body.id;
            
              // Make the GET request using await
              const getResponse = await request.get(`/receipts/${receiptId}/points`);
              expect(getResponse.status).to.equal(200);
              expect(getResponse.body).to.have.property('points');
    
    });

    it('should throw an appropriate error when ID is not found', async() => {
            const invalidReceiptId = 'byx1cby';      
            const res = await request.get(`/receipts/${invalidReceiptId}/points`)
            expect(res.status).to.equal(404);
            expect(res.body).to.have.property('error');
            expect(res.body.error).to.equal('Receipt not found');
              
    });
});

describe('Receipt Processing', () => {
  it('should trim item descriptions', async() => {
    const receiptData = {
      retailer: 'Sample Retailer',
      purchaseDate: '2023-09-15',
      purchaseTime: '15:30',
      items: [
        {
          shortDescription: '   Item 1  ', // Item description with leading/trailing spaces
          price: '10.99',
        },
      ],
      total: '10.99',
    };


    request.post('/receipts/process')
           .send(receiptData)
            .end((err, res) => {
        expect(200);

        const receiptId = res.body.id;
        request.get(`/receipts/${receiptId}/points`)
        .end((err, res) => {
          expect(200);
          if (res.body && Array.isArray(res.body.items) && res.body.items.length > 0) {
            const trimmedDescription = res.body.items[0].shortDescription;
            expect(trimmedDescription).to.equal('Item 1');
          } else {
            console.error("Invalid response structure or empty items array");
          }

      });

    });
  });

  it('should award 50 points for a round total', async () => {
    const receiptData = {
      retailer: 'Sample Retailer',
      purchaseDate: '2023-09-15',
      purchaseTime: '15:30',
      items: [
        {
          shortDescription: 'Item 1',
          price: '9.00',
        },
      ],
      total: '9.00',
    };
  
    const postResponse = await request.post('/receipts/process').send(receiptData);
    expect(postResponse.status).to.equal(200);
  
    const receiptId = postResponse.body.id;
  
    // Send a GET request to retrieve points
    const getResponse = await request.get(`/receipts/${receiptId}/points`);
    expect(getResponse.status).to.equal(200);
    expect(getResponse.body.points).to.equal(101);
        // Points after rule 1 14
        // Points after rule 2 64
        // Points after rule 3 89
        // Points after rule 4 89
        // Points after rule 5 91
        // Points after rule 7 i.e. total = 101
  });  
});
