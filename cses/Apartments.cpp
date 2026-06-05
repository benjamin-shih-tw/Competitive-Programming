#pragma GCC optimize("O3,unroll-loops")
#include <bits/stdc++.h>
#pragma GCC target("avx2,bmi,bmi2,lzcnt,popcnt")
using namespace std;
using ll = long long;
#define pii pair<int,int>
#define SZ(x) ((int)(x).size())
#define ALL(x) (x).begin(),(x).end()
#define fo(i,n) for(int i = 0 ; i < (n) ; i++)
#define foo(i,a,b) for(int i = (a) ; i <= (b) ; i++)
#define F first
#define S second
#define pb push_back
int main(){
    ios::sync_with_stdio(0);cin.tie(0);
    int n,m,k;
    cin >> n >> m >> k;
    vector<int> v(n),vv(m); fo(i,n) cin >> v[i]; fo(i,m) cin >> vv[i];
    int I = 0,II = 0;
    int cnt = 0;
    sort(ALL(v)),sort(ALL(vv));
    while(I < n && II < m){
        if(vv[II] < v[I] - k){
            II++;
        }
        else if(vv[II] > v[I] + k){
            I++;
        }
        else{
            II++;
            I++;
            cnt++;
        }
    }
    cout << cnt;
}